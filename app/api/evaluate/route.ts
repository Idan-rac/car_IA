import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Add debug logging
console.log('OpenAI API Key length:', process.env.OPENAI_API_KEY?.length);
console.log('OpenAI API Key first 4 chars:', process.env.OPENAI_API_KEY?.substring(0, 4));
console.log('OpenAI API Key last 4 chars:', process.env.OPENAI_API_KEY?.substring(process.env.OPENAI_API_KEY.length - 4));

// Types for our data
interface CarData {
    title?: string;
    mileage?: number;
    price?: number;
    ownership?: number;
    gearbox?: string;
    engineType?: string;
    year?: number;
    [key: string]: any;
}

interface EvaluationResponse {
    carData: CarData;
    evaluation: string;
    recommendation: string;
    score: number;
}

// Translation mappings for recommendations
const recommendations = {
    en: {
        'Good deal': 'Good deal',
        'Not recommended': 'Not recommended',
        'Neutral – depends': 'Neutral – depends'
    },
    he: {
        'Good deal': 'עסקה טובה',
        'Not recommended': 'לא מומלץ',
        'Neutral – depends': 'תלוי בהעדפות'
    }
};

async function scrapeYad2(url: string): Promise<CarData> {
    let browser;
    try {
        console.log('Starting Yad2 scraping for URL:', url);

        // Launch Puppeteer with additional configurations
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--window-size=1920,1080'
            ]
        });

        const page = await browser.newPage();

        // Enable console logging from the page
        page.on('console', msg => console.log('Page log:', msg.text()));

        // Set a realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        console.log('Browser configured with user agent');

        // Set viewport
        await page.setViewport({ width: 1920, height: 1080 });

        // Enable request interception
        await page.setRequestInterception(true);

        // Block unnecessary resources
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                request.abort();
            } else {
                request.continue();
            }
        });

        console.log('Navigating to URL...');
        // Navigate to the URL with extended timeout
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 60000
        });
        console.log('Page loaded');

        // Check for CAPTCHA
        const isCaptcha = await page.evaluate(() => {
            return document.body.textContent?.includes('אנו מניחים שגולשים כאן בני אנוש') || false;
        });

        if (isCaptcha) {
            console.log('CAPTCHA detected');
            throw new Error('CAPTCHA detected. Please try again later or use manual input.');
        }

        console.log('Waiting for main content...');
        // Wait for the main content
        await page.waitForSelector('.feeditem-ld', { timeout: 10000 }).catch(() => {
            console.log('Could not find main content container');
            throw new Error('Could not find car listing content. The page structure might have changed.');
        });
        console.log('Main content found');

        // Take a screenshot for debugging
        await page.screenshot({ path: 'yad2-debug.png' });
        console.log('Debug screenshot saved');

        // Extract car details
        console.log('Extracting car details...');
        const carData = await page.evaluate(() => {
            const getText = (selector: string) => {
                const element = document.querySelector(selector);
                return element ? element.textContent?.trim() : '';
            };

            const getNumber = (selector: string) => {
                const text = getText(selector);
                return text ? parseInt(text.replace(/[^0-9]/g, '')) : 0;
            };

            // Log the page structure for debugging
            console.log('Page structure:', document.body.innerHTML);

            // Extract title (try multiple possible selectors)
            const titleSelectors = [
                '.feeditem-ld h1',
                '.feeditem-ld .title',
                '.feeditem-ld .feeditem-title'
            ];
            let title = '';
            for (const selector of titleSelectors) {
                title = getText(selector);
                if (title) {
                    console.log('Found title using selector:', selector);
                    break;
                }
            }

            // Extract price (try multiple possible selectors)
            const priceSelectors = [
                '.feeditem-ld .price',
                '.feeditem-ld .feeditem-price',
                '.feeditem-ld [data-test-id="price"]'
            ];
            let price = 0;
            for (const selector of priceSelectors) {
                const priceText = getText(selector);
                if (priceText) {
                    price = parseInt(priceText.replace(/[^0-9]/g, ''));
                    if (price > 0) {
                        console.log('Found price using selector:', selector);
                        break;
                    }
                }
            }

            // Extract year from title or details
            const yearMatch = title.match(/\b(19|20)\d{2}\b/);
            const year = yearMatch ? parseInt(yearMatch[0]) : 0;
            console.log('Extracted year:', year);

            // Extract mileage (try multiple possible selectors)
            const mileageSelectors = [
                '.feeditem-ld .mileage',
                '.feeditem-ld [data-test-id="mileage"]',
                '.feeditem-ld .feeditem-mileage'
            ];
            let mileage = 0;
            for (const selector of mileageSelectors) {
                const mileageText = getText(selector);
                if (mileageText) {
                    mileage = parseInt(mileageText.replace(/[^0-9]/g, ''));
                    if (mileage > 0) {
                        console.log('Found mileage using selector:', selector);
                        break;
                    }
                }
            }

            // Extract ownership
            const ownershipText = getText('.feeditem-ld .ownership') || getText('.feeditem-ld [data-test-id="ownership"]');
            const ownership = ownershipText ? parseInt(ownershipText.replace(/[^0-9]/g, '')) : 1;
            console.log('Extracted ownership:', ownership);

            // Extract gearbox
            const gearboxText = getText('.feeditem-ld .gearbox') || getText('.feeditem-ld [data-test-id="gearbox"]');
            const gearbox = gearboxText || 'אוטומטית';
            console.log('Extracted gearbox:', gearbox);

            // Extract engine type
            const engineTypeText = getText('.feeditem-ld .engine-type') || getText('.feeditem-ld [data-test-id="engine-type"]');
            const engineType = engineTypeText || 'בנזין';
            console.log('Extracted engine type:', engineType);

            return {
                title,
                price,
                year,
                mileage,
                ownership,
                gearbox,
                engineType
            };
        });

        console.log('Extracted car data:', carData);

        // Validate extracted data
        if (!carData.title || !carData.price || !carData.year) {
            console.log('Validation failed - missing required fields');
            throw new Error('Failed to extract required car details. Please try using manual input instead.');
        }

        return carData;
    } catch (error) {
        console.error('Error scraping Yad2:', error);
        throw new Error(
            error instanceof Error && error.message.includes('CAPTCHA')
                ? error.message
                : 'Failed to scrape car data from Yad2. Please try using manual input instead.'
        );
    } finally {
        if (browser) {
            await browser.close();
            console.log('Browser closed');
        }
    }
}

async function evaluateWithLLM(carData: CarData, language: 'en' | 'he' = 'en'): Promise<EvaluationResponse> {
    try {
        console.log('Starting evaluateWithLLM with data:', carData);
        console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);

        const systemPrompt = language === 'he'
            ? "אתה מומחה בכיר להערכת רכבים, בעל ידע נרחב בשוק הרכב ומוניטין של מתן ניתוחים מקיפים ואמינים. המטרה שלך היא לספק למשתמש הערכה מעמיקה, מנומקת היטב, ומקיפה לגבי האם כדאי לרכוש רכב משומש. התשובה שלך חייבת להיות בפורמט JSON בלבד ולכלול את השדות evaluation, recommendation, ו-score. ספק ניתוח מעמיק ומקיף של כל פרטי הרכב, כולל יתרונות, חסרונות, והתייחסות לערך שוק, בעיות נפוצות לדגם/שנה, וכיצד כל פרמטר משפיע על ההערכה הכוללת. התמקד במתן מידע מהימן שיסייע למשתמש לקבל החלטה מושכלת, כאילו ביצעת 'בדיקה עמוקה' וחיפוש נרחב של מידע אמין באינטרנט. הסבר בפירוט ובשפה ברורה מדוע הרכב מומלץ או לא מומלץ."
            : "You are a senior car evaluation expert with extensive knowledge of the automotive market and a reputation for providing comprehensive and reliable analyses. Your goal is to provide the user with an in-depth, well-reasoned, and holistic evaluation of whether a used car is worth buying. Your response must be in JSON format only and include 'evaluation', 'recommendation', and 'score' fields. Provide a thorough and comprehensive analysis of all car details, including pros, cons, market value considerations, common issues for the specific model/year, and how each parameter influences the overall assessment. Focus on delivering trustworthy insights that help the user make an informed decision, as if you have performed a 'deep check' and extensive reliable online research. Explain in detail and in clear language why the car is recommended or not recommended.";

        const userPrompt = language === 'he'
            ? `
            נתח את פרטי הרכב הבאים ותן הערכה מעמיקה: 
            ${JSON.stringify(carData, null, 2)}
            
            שקול את כל הפרמטרים שניתנו בזהירות. בנה הסבר מפורט שמציין יתרונות וחסרונות ספציפיים לרכב זה, בהתבסס על ניסיונך כמומחה ועל ידע כללי לגבי דגם ו'שנתון' הרכב. 
            
            החזר אובייקט JSON עם השדות הבאים:
            - "recommendation": המלצה ברורה אחת מבין "עסקה טובה", "לא מומלץ", או "תלוי בהעדפות"
            - "evaluation": הסבר מפורט ומקיף ביותר להמלצתך. זה צריך להיות ניתוח עשיר בתוכן המפרט את הסיבות מאחורי הציון וההמלצה, כולל יתרונות, חסרונות, דגשים חשובים לקונה, וכל מידע רלוונטי שאתה כמומחה יכול לספק כאילו בדקת את הרכב לעומק.
            - "score": ציון מספרי מ-0 עד 100 התואם את המלצתך והניתוח המפורט שלך.
            `
            : `
            Analyze the following car details and provide an in-depth evaluation: 
            ${JSON.stringify(carData, null, 2)}
            
            Carefully consider all provided parameters. Construct a detailed explanation that outlines specific pros and cons for this car, based on your expert experience and general knowledge about the car's model and year. 
            
            Return a JSON object with the following fields:
            - "recommendation": A clear recommendation, one of "Good deal", "Not recommended", or "Neutral – depends"
            - "evaluation": A highly detailed and comprehensive explanation for your recommendation. This should be a content-rich analysis elaborating on the reasons behind the score and recommendation, including pros, cons, important considerations for the buyer, and any relevant expert insights you can provide as if you've deeply investigated the car.
            - "score": A numerical score from 0 to 100 that aligns with your recommendation and detailed analysis.
            `;

        console.log('Making OpenAI API call...');
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });
        console.log('OpenAI API call completed');

        const rawResponse = completion.choices[0].message.content;
        console.log('OpenAI raw response:', rawResponse);

        let parsedResponse: { recommendation: string, evaluation: string, score: number };
        try {
            parsedResponse = JSON.parse(rawResponse || '{}');
        } catch (jsonError) {
            console.error('Failed to parse LLM response as JSON:', jsonError);
            throw new Error(language === 'he' ? 'תגובת AI שגויה' : 'Invalid AI response');
        }

        const recommendation = parsedResponse.recommendation || 'Neutral – depends';
        const evaluation = parsedResponse.evaluation || (language === 'he' ? 'לא ניתן להעריך' : 'Unable to evaluate');
        const score = parsedResponse.score !== undefined ? parsedResponse.score : 50; // Default score if not provided

        const translatedRecommendation = recommendations[language][recommendation as 'Good deal' | 'Not recommended' | 'Neutral – depends'] || recommendation;

        return {
            carData,
            evaluation: evaluation,
            recommendation: translatedRecommendation,
            score: score
        };
    } catch (error) {
        console.error('Error in evaluateWithLLM:', error);
        throw new Error(language === 'he' ? 'שגיאה בהערכת הרכב' : 'Failed to evaluate car data');
    }
}

export async function POST(request: Request) {
    try {
        console.log('API route called');
        const body = await request.json();
        console.log('Request body:', body);
        let carData: CarData;
        const language = body.language || 'en';

        if (body.yad2Url) {
            console.log('Processing Yad2 URL:', body.yad2Url);
            carData = await scrapeYad2(body.yad2Url);
        } else if (body.carData) {
            console.log('Processing manual car data:', body.carData);
            carData = body.carData;
        } else {
            console.log('No valid input data provided');
            return NextResponse.json(
                { error: language === 'he' ? 'נדרש קישור יד2 או פרטי רכב' : 'Either yad2Url or carData must be provided' },
                { status: 400 }
            );
        }

        console.log('Car data processed:', carData);
        console.log('Calling evaluateWithLLM...');

        // Evaluate the car data using LLM
        const evaluation = await evaluateWithLLM(carData, language);
        console.log('Evaluation completed:', evaluation);

        return NextResponse.json(evaluation);
    } catch (error) {
        console.error('Detailed error in evaluation endpoint:', error);
        return NextResponse.json(
            {
                error: 'Failed to process car evaluation',
                details: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
} 