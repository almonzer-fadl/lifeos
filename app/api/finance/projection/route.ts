import { NextRequest, NextResponse } from "next/server";
import { projectIncome, calculateRunway } from "@/lib/runway";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const additionalIncome = parseInt(searchParams.get("additionalMonthlyIncome") || "0");

  if (!additionalIncome || additionalIncome <= 0) {
    const current = await calculateRunway();
    return NextResponse.json({
      current,
      projection: null,
      message: `Provide ?additionalMonthlyIncome=<cents> to see projections`,
    });
  }

  const projection = await projectIncome(additionalIncome);
  const current = await calculateRunway();

  return NextResponse.json({
    current: {
      runwayMonths: current.runwayMonths,
      monthsToGoal: current.monthsToGoal,
      monthlyIncome: current.monthlyIncome,
      monthlyBurnRate: current.monthlyBurnRate,
    },
    projection,
  });
}
