import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Hangi modeli kullanmak istiyorsan burada değiştirebilirsin
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export async function generateQuestions(cvText: string): Promise<string[]> {
  try {
    const prompt = `
      Aşağıdaki CV metnini analiz et. Bu adaya teknik mülakatta sorulabilecek, 
      yetkinliklerini ölçmeye yönelik, zorluk derecesi orta-ileri düzeyde 
      5 adet teknik soru hazırla.
      
      Çıktıyı SADECE geçerli bir JSON array formatında ver. 
      Örnek format: ["Soru 1", "Soru 2", "Soru 3", "Soru 4", "Soru 5"]
      
      CV METNİ:
      ${cvText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = await response.text();

    // JSON temizliği (Markdown backtick'lerini kaldır)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini API Hatası:', err);
    return [
      "CV'nizdeki en güçlü teknik beceri nedir?",
      "Daha önce karşılaştığınız zor bir problemi anlatın.",
      "Takım çalışması deneyiminizden bahsedin.",
      "Neden bu pozisyon?",
      "Gelecek hedefleriniz neler?"
    ];
  }
}

export async function evaluateAnswers(
  cvText: string, 
  qa: any
): Promise<{ score: number, feedback: string }> {
  try {
    const prompt = `
      Sen uzman bir teknik mülakatçısın. Aşağıdaki CV sahibine sorulan soruları 
      ve adayın verdiği cevapları değerlendir.

      CV ÖZETİ: ${cvText.substring(0, 1000)}...

      SORU VE CEVAPLAR:
      ${JSON.stringify(qa)}

      Lütfen JSON formatında şu çıktıyı ver:
      {
        "score": (0-100 arası sayı),
        "feedback": "Adaya yönelik teknik ve yapıcı geri bildirim cümlesi."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = await response.text();

    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);

  } catch (err) {
    console.error('Değerlendirme Hatası:', err);
    return {
      score: 0,
      feedback: "Değerlendirme yapılamadı."
    };
  }
}
