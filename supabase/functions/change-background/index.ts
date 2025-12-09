import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { imageBase64, backgroundType, backgroundColor, backgroundImageBase64, backgroundPreset } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Missing imageBase64 in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing background change request...");
    console.log("Background type:", backgroundType);

    // Build the prompt based on background type
    let prompt = "";
    
    if (backgroundType === "color") {
      prompt = `Remove the background from this image and replace it with a solid ${backgroundColor} color background. Keep the main subject/foreground intact with clean edges. The new background should be a uniform ${backgroundColor} color filling the entire image area behind the subject.`;
    } else if (backgroundType === "preset") {
      const presetDescriptions: Record<string, string> = {
        "gradient-sunset": "a beautiful gradient background transitioning from warm orange to pink to purple, like a sunset sky",
        "gradient-ocean": "a calming gradient background transitioning from light blue to deep teal, like an ocean",
        "gradient-forest": "a natural gradient background transitioning from light green to deep forest green",
        "studio-white": "a clean, professional white studio background with soft shadows",
        "studio-gray": "a professional neutral gray studio background",
        "bokeh-lights": "a dreamy bokeh background with soft, blurred colorful lights",
        "nature-blur": "a softly blurred natural outdoor background with green foliage",
        "office-blur": "a professional blurred office environment background",
      };
      const description = presetDescriptions[backgroundPreset] || "a professional studio background";
      prompt = `Remove the background from this image and replace it with ${description}. Keep the main subject/foreground intact with clean, natural edges that blend well with the new background.`;
    } else if (backgroundType === "image" && backgroundImageBase64) {
      prompt = `This is a composite request. Take the main subject/foreground from the first image (remove its background) and place it naturally onto the second background image. Blend the edges seamlessly so it looks like the subject was photographed in front of that background.`;
    } else {
      prompt = `Remove the background from this image and replace it with a clean white background. Keep the main subject intact.`;
    }

    // Build the message content
    const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: imageBase64 } },
    ];

    // Add background image if provided
    if (backgroundType === "image" && backgroundImageBase64) {
      content.push({ type: "image_url", image_url: { url: backgroundImageBase64 } });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{ role: "user", content }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to process image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received successfully");

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "No image returned from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl,
        message: data.choices?.[0]?.message?.content || "Background changed successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in change-background function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
