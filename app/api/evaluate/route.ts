import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

function calculateScore(carData: CarData): number {
    let score = 50; // Start with a neutral score

    // Year score (max 20 points)
    const currentYear = new Date().getFullYear();
    const age = currentYear - (carData.year || currentYear);
    if (age <= 2) score += 20;
    else if (age <= 5) score += 15;
    else if (age <= 8) score += 10;
    else if (age <= 12) score += 5;

    // Mileage score (max 20 points)
    const mileage = carData.mileage || 0;
    if (mileage <= 20000) score += 20;
    else if (mileage <= 50000) score += 15;
    else if (mileage <= 100000) score += 10;
    else if (mileage <= 150000) score += 5;

    // Ownership score (max 10 points)
    const ownership = carData.ownership || 1;
    if (ownership === 1) score += 10;
    else if (ownership === 2) score += 5;

    // Price score (max 20 points)
    // This is a simplified calculation - in a real app, you'd want to compare against market averages
    const price = carData.price || 0;
    if (price <= 50000) score += 20;
    else if (price <= 100000) score += 15;
    else if (price <= 150000) score += 10;
    else if (price <= 200000) score += 5;

    // Engine type bonus (max 10 points)
    const engineType = (carData.engineType || '').toLowerCase();
    if (engineType.includes('hybrid') || engineType.includes('electric')) score += 10;
    else if (engineType.includes('diesel')) score += 5;

    // Ensure score is between 0 and 100
    return Math.min(Math.max(score, 0), 100);
}

async function evaluateWithLLM(carData: CarData, language: 'en' | 'he' = 'en'): Promise<EvaluationResponse> {
    try {
        const systemPrompt = language === 'he'
            ? "אתה מומחה להערכת רכבים. נתח את פרטי הרכב שסופקו ותן המלצה ברורה."
            : "You are a car evaluation expert. Analyze the provided car details and give a clear recommendation.";

        const userPrompt = language === 'he'
            ? `
            נתח את פרטי הרכב הבאים ותן הערכה:
            ${JSON.stringify(carData, null, 2)}
            
            שקול:
            1. ערך שוק
            2. מצב הרכב
            3. היסטוריית בעלות
            4. מוניטין הדגם
            5. יחס מחיר-ערך
            
            תן המלצה ברורה: "עסקה טובה", "לא מומלץ", או "תלוי בהעדפות"
            כלול הסבר קצר להמלצתך.
            `
            : `
            Analyze the following car details and provide an evaluation:
            ${JSON.stringify(carData, null, 2)}
            
            Consider:
            1. Market value
            2. Car condition
            3. Ownership history
            4. Model reputation
            5. Price-to-value ratio
            
            Provide a clear recommendation: "Good deal", "Not recommended", or "Neutral – depends"
            Include a brief explanation for your recommendation.
            `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
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
        });

        const response = completion.choices[0].message.content;

        // Parse the LLM response to extract recommendation
        let recommendation: 'Good deal' | 'Not recommended' | 'Neutral – depends' = 'Neutral – depends';
        if (language === 'he') {
            if (response?.includes('עסקה טובה')) {
                recommendation = 'Good deal';
            } else if (response?.includes('לא מומלץ')) {
                recommendation = 'Not recommended';
            }
        } else {
            if (response?.toLowerCase().includes('good deal')) {
                recommendation = 'Good deal';
            } else if (response?.toLowerCase().includes('not recommended')) {
                recommendation = 'Not recommended';
            }
        }

        // Calculate score based on car data
        const score = calculateScore(carData);

        // Translate recommendation to the selected language
        const translatedRecommendation = recommendations[language][recommendation];

        return {
            carData,
            evaluation: response || (language === 'he' ? 'לא ניתן להעריך' : 'Unable to evaluate'),
            recommendation: translatedRecommendation,
            score
        };
    } catch (error) {
        console.error('Error evaluating with LLM:', error);
        throw new Error(language === 'he' ? 'שגיאה בהערכת הרכב' : 'Failed to evaluate car data');
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        let carData: CarData;
        const language = body.language || 'en';

        if (body.yad2Url) {
            // Handle Yad2 URL scraping
            carData = await scrapeYad2(body.yad2Url);
        } else if (body.carData) {
            // Handle manual input
            carData = body.carData;
        } else {
            return NextResponse.json(
                { error: language === 'he' ? 'נדרש קישור יד2 או פרטי רכב' : 'Either yad2Url or carData must be provided' },
                { status: 400 }
            );
        }

        // Evaluate the car data using LLM
        const evaluation = await evaluateWithLLM(carData, language);

        return NextResponse.json(evaluation);
    } catch (error) {
        console.error('Error in evaluation endpoint:', error);
        return NextResponse.json(
            { error: 'Failed to process car evaluation' },
            { status: 500 }
        );
    }
} 