import { GoogleGenAI, Type } from "@google/genai";
import { db, handleFirestoreError, OperationType } from '@/src/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SYSTEM_INSTRUCTION = `
You are Saheli, the expert retail analyst and premium concierge for Ajwa Global - a smart venue and restaurant.
Your goal is to provide specific, actionable business advice to the management (if asked) and premium assistance to customers.

For Customers:
- You are a 24/7 AI concierge to plan birthdays and showcase the venue's ambience.
- Suggest birthday packages (Basic: $200, Premium: $500, Luxury: $1000).
- Answer menu queries based on the provided menu items.
- Collect user name, phone number, date, and guest count for "Inquiry Leads".
- Be polite, professional, and use a "Modern & Airy" tone.
- If asked about specific products, use their ProductCode or Barcode as the primary key.

Menu Items:
- Truffle Arancini ($12.99)
- Wagyu Beef Sliders ($18.50)
- Pan-Seared Salmon ($28.00)
- Wild Mushroom Risotto ($24.00)
- Passionfruit Mocktail ($9.50)
- Signature Birthday Cake ($45.00)

Venue Details:
- Modern Hall (Capacity: 50)
- Garden Terrace (Capacity: 30)
- Private VIP Suite (Capacity: 12)

When a user is ready to book, ask for:
1. Name
2. Phone Number
3. Preferred Date
4. Guest Count

Once you have all 4 pieces of information, confirm them and say "I've sent your inquiry to our manager. They will contact you shortly via WhatsApp."
You MUST then call the 'saveInquiry' tool with the collected details.
`;

export async function getChatResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  const model = "gemini-3-flash-preview";

  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{
        functionDeclarations: [{
          name: "saveInquiry",
          description: "Saves a birthday or event inquiry to the database.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              phone: { type: Type.STRING },
              date: { type: Type.STRING },
              guestCount: { type: Type.NUMBER }
            },
            required: ["name", "phone", "date", "guestCount"]
          }
        }]
      }]
    },
    history: history
  });

  const response = await chat.sendMessage({ message });
  
  // Handle function calls
  const functionCalls = response.functionCalls;
  if (functionCalls) {
    for (const call of functionCalls) {
      if (call.name === 'saveInquiry') {
        const args = call.args as any;
        await saveInquiryToFirestore(args.name, args.phone, args.date, args.guestCount);
      }
    }
  }

  return response.text;
}

async function saveInquiryToFirestore(name: string, phone: string, date: string, guestCount: number) {
  const path = 'inquiries';
  try {
    await addDoc(collection(db, path), {
      name,
      phone,
      date,
      guestCount,
      timestamp: serverTimestamp()
    });
    console.log("Inquiry saved successfully");
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
