// Common lab test reference ranges for adult males
// Ranges vary by lab — these are general guidelines

const labRanges = [
  // Complete Blood Count
  { testName: "WBC", value: 0, unit: "10³/µL", refRangeLow: 4.0, refRangeHigh: 11.0 },
  { testName: "RBC", value: 0, unit: "10⁶/µL", refRangeLow: 4.5, refRangeHigh: 6.0 },
  { testName: "Hemoglobin", value: 0, unit: "g/dL", refRangeLow: 13.5, refRangeHigh: 17.5 },
  { testName: "Hematocrit", value: 0, unit: "%", refRangeLow: 40, refRangeHigh: 52 },
  { testName: "MCV", value: 0, unit: "fL", refRangeLow: 80, refRangeHigh: 100 },
  { testName: "MCH", value: 0, unit: "pg", refRangeLow: 27, refRangeHigh: 33 },
  { testName: "MCHC", value: 0, unit: "g/dL", refRangeLow: 32, refRangeHigh: 36 },
  { testName: "RDW", value: 0, unit: "%", refRangeLow: 11.5, refRangeHigh: 14.5 },
  { testName: "Platelets", value: 0, unit: "10³/µL", refRangeLow: 150, refRangeHigh: 450 },
  { testName: "Neutrophils", value: 0, unit: "%", refRangeLow: 40, refRangeHigh: 75 },
  { testName: "Lymphocytes", value: 0, unit: "%", refRangeLow: 20, refRangeHigh: 45 },
  { testName: "Monocytes", value: 0, unit: "%", refRangeLow: 2, refRangeHigh: 10 },
  { testName: "Eosinophils", value: 0, unit: "%", refRangeLow: 1, refRangeHigh: 6 },
  { testName: "Basophils", value: 0, unit: "%", refRangeLow: 0, refRangeHigh: 2 },

  // Diabetes
  { testName: "HbA1c", value: 0, unit: "%", refRangeLow: 4.0, refRangeHigh: 5.6 },
  { testName: "Fasting Glucose", value: 0, unit: "mg/dL", refRangeLow: 70, refRangeHigh: 100 },
  { testName: "Random Glucose", value: 0, unit: "mg/dL", refRangeLow: 70, refRangeHigh: 140 },
  { testName: "C-Peptide", value: 0, unit: "ng/mL", refRangeLow: 0.8, refRangeHigh: 3.1 },
  { testName: "Insulin (Fasting)", value: 0, unit: "µIU/mL", refRangeLow: 2.6, refRangeHigh: 24.9 },

  // Lipids
  { testName: "Total Cholesterol", value: 0, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 200 },
  { testName: "LDL Cholesterol", value: 0, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 100 },
  { testName: "HDL Cholesterol", value: 0, unit: "mg/dL", refRangeLow: 40, refRangeHigh: 999 },
  { testName: "Triglycerides", value: 0, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 150 },
  { testName: "Non-HDL Cholesterol", value: 0, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 130 },

  // Thyroid
  { testName: "TSH", value: 0, unit: "mIU/L", refRangeLow: 0.4, refRangeHigh: 4.5 },
  { testName: "Free T4", value: 0, unit: "ng/dL", refRangeLow: 0.8, refRangeHigh: 1.8 },
  { testName: "Free T3", value: 0, unit: "pg/mL", refRangeLow: 2.3, refRangeHigh: 4.2 },
  { testName: "Anti-TPO", value: 0, unit: "IU/mL", refRangeLow: 0, refRangeHigh: 34 },
  { testName: "Anti-Thyroglobulin", value: 0, unit: "IU/mL", refRangeLow: 0, refRangeHigh: 40 },

  // Liver
  { testName: "ALT", value: 0, unit: "U/L", refRangeLow: 7, refRangeHigh: 56 },
  { testName: "AST", value: 0, unit: "U/L", refRangeLow: 10, refRangeHigh: 40 },
  { testName: "ALP", value: 0, unit: "U/L", refRangeLow: 44, refRangeHigh: 147 },
  { testName: "GGT", value: 0, unit: "U/L", refRangeLow: 9, refRangeHigh: 48 },
  { testName: "Total Bilirubin", value: 0, unit: "mg/dL", refRangeLow: 0.1, refRangeHigh: 1.2 },
  { testName: "Albumin", value: 0, unit: "g/dL", refRangeLow: 3.5, refRangeHigh: 5.0 },
  { testName: "Total Protein", value: 0, unit: "g/dL", refRangeLow: 6.0, refRangeHigh: 8.3 },

  // Kidney
  { testName: "Creatinine", value: 0, unit: "mg/dL", refRangeLow: 0.7, refRangeHigh: 1.3 },
  { testName: "BUN", value: 0, unit: "mg/dL", refRangeLow: 7, refRangeHigh: 20 },
  { testName: "eGFR", value: 0, unit: "mL/min/1.73m²", refRangeLow: 90, refRangeHigh: 999 },
  { testName: "Uric Acid", value: 0, unit: "mg/dL", refRangeLow: 3.5, refRangeHigh: 7.2 },
  { testName: "Cystatin C", value: 0, unit: "mg/L", refRangeLow: 0.5, refRangeHigh: 1.0 },

  // Electrolytes
  { testName: "Sodium", value: 0, unit: "mmol/L", refRangeLow: 135, refRangeHigh: 145 },
  { testName: "Potassium", value: 0, unit: "mmol/L", refRangeLow: 3.5, refRangeHigh: 5.1 },
  { testName: "Chloride", value: 0, unit: "mmol/L", refRangeLow: 96, refRangeHigh: 106 },
  { testName: "Calcium", value: 0, unit: "mg/dL", refRangeLow: 8.5, refRangeHigh: 10.5 },
  { testName: "Magnesium", value: 0, unit: "mg/dL", refRangeLow: 1.7, refRangeHigh: 2.3 },
  { testName: "Phosphorus", value: 0, unit: "mg/dL", refRangeLow: 2.5, refRangeHigh: 4.5 },

  // Iron Studies
  { testName: "Iron", value: 0, unit: "µg/dL", refRangeLow: 60, refRangeHigh: 170 },
  { testName: "Ferritin", value: 0, unit: "ng/mL", refRangeLow: 30, refRangeHigh: 400 },
  { testName: "Transferrin", value: 0, unit: "mg/dL", refRangeLow: 200, refRangeHigh: 400 },
  { testName: "TIBC", value: 0, unit: "µg/dL", refRangeLow: 250, refRangeHigh: 450 },
  { testName: "Transferrin Saturation", value: 0, unit: "%", refRangeLow: 15, refRangeHigh: 50 },

  // Vitamins
  { testName: "Vitamin D (25-OH)", value: 0, unit: "ng/mL", refRangeLow: 30, refRangeHigh: 100 },
  { testName: "Vitamin B12", value: 0, unit: "pg/mL", refRangeLow: 200, refRangeHigh: 900 },
  { testName: "Folate", value: 0, unit: "ng/mL", refRangeLow: 3, refRangeHigh: 20 },

  // Hormones
  { testName: "Total Testosterone", value: 0, unit: "ng/dL", refRangeLow: 300, refRangeHigh: 1000 },
  { testName: "Free Testosterone", value: 0, unit: "pg/mL", refRangeLow: 50, refRangeHigh: 210 },
  { testName: "SHBG", value: 0, unit: "nmol/L", refRangeLow: 10, refRangeHigh: 57 },
  { testName: "Estradiol", value: 0, unit: "pg/mL", refRangeLow: 10, refRangeHigh: 40 },
  { testName: "Prolactin", value: 0, unit: "ng/mL", refRangeLow: 2, refRangeHigh: 18 },
  { testName: "DHEA-S", value: 0, unit: "µg/dL", refRangeLow: 70, refRangeHigh: 495 },
  { testName: "Cortisol (AM)", value: 0, unit: "µg/dL", refRangeLow: 6, refRangeHigh: 23 },
  { testName: "IGF-1", value: 0, unit: "ng/mL", refRangeLow: 115, refRangeHigh: 355 },

  // Inflammation
  { testName: "CRP", value: 0, unit: "mg/L", refRangeLow: 0, refRangeHigh: 3 },
  { testName: "hs-CRP", value: 0, unit: "mg/L", refRangeLow: 0, refRangeHigh: 1 },
  { testName: "ESR", value: 0, unit: "mm/hr", refRangeLow: 0, refRangeHigh: 20 },

  // Cardiac
  { testName: "Troponin I", value: 0, unit: "ng/mL", refRangeLow: 0, refRangeHigh: 0.04 },
  { testName: "CK-MB", value: 0, unit: "ng/mL", refRangeLow: 0, refRangeHigh: 5 },
  { testName: "BNP", value: 0, unit: "pg/mL", refRangeLow: 0, refRangeHigh: 100 },
  { testName: "Homocysteine", value: 0, unit: "µmol/L", refRangeLow: 4, refRangeHigh: 15 },
  { testName: "ApoB", value: 0, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 90 },
  { testName: "Lipoprotein(a)", value: 0, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 30 },

  // Urinalysis
  { testName: "Urine pH", value: 0, unit: "", refRangeLow: 5.0, refRangeHigh: 8.0 },
  { testName: "Urine Specific Gravity", value: 0, unit: "", refRangeLow: 1.005, refRangeHigh: 1.030 },
  { testName: "Microalbumin", value: 0, unit: "mg/24h", refRangeLow: 0, refRangeHigh: 30 },
  { testName: "Urine Creatinine", value: 0, unit: "mg/dL", refRangeLow: 40, refRangeHigh: 300 },

  // Other
  { testName: "PSA", value: 0, unit: "ng/mL", refRangeLow: 0, refRangeHigh: 4 },
  { testName: "Ammonia", value: 0, unit: "µg/dL", refRangeLow: 15, refRangeHigh: 45 },
  { testName: "Lactate", value: 0, unit: "mmol/L", refRangeLow: 0.5, refRangeHigh: 2.2 },
  { testName: "Ketones", value: 0, unit: "mmol/L", refRangeLow: 0, refRangeHigh: 0.6 },
  { testName: "Osmolality", value: 0, unit: "mOsm/kg", refRangeLow: 275, refRangeHigh: 295 },
];

export default labRanges;
