// app/api/create-product/route.js
import { NextResponse } from 'next/server';
import Shopify from '@shopify/shopify-api';

export async function POST(request : any, response: any) {
    const body = await request.json();
    const { url,title } = body;
    console.log("URL : ", url)
  try {
    const product ={
        "title": title,
        "body_html": "<strong>Custom Product Configurator</strong>",
        "vendor": "14Style",
        "product_type": "Jacket",
        "status": "active",
        // "variants": [
        // {
        //     "option1": "Default Title",
        //     "price": "1000000",
        //     "sku": "BCF151",
        //     "inventory_quantity": 10
        // }
        // ],
        "images": [
        {
            "src": url
        }
        ],
        // "options": [
        // {
        //     "name": "Size",
        //     "values": ["151"]
        // }
        // ]
    };

    const res :any = await fetch('https://746fd6-78.myshopify.com/admin/api/2024-07/products.json', {
        method: 'POST',
        headers: {
            'X-Shopify-Access-Token': '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', // Use environment variable for access token
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product }),
    });

    const data = await res.json();

    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
