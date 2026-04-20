import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { players, label } = await req.json();

  if (!players?.length) {
    return NextResponse.json({ error: "No players" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("snapshots")
    .insert({ players, label })
    .select("id")
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
