from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import matplotlib.pyplot as plt
import base64
import os
import io
from openpyxl import Workbook
from openpyxl.drawing.image import Image as XLImage
from openpyxl.utils.dataframe import dataframe_to_rows

app = FastAPI()

class AnalysisRequest(BaseModel):
    column_filter: Optional[str] = None
    value_filter: Optional[str] = None

@app.post("/analyze")
async def analyze_excel(
    file: UploadFile = File(...),
    req: AnalysisRequest = AnalysisRequest()
):
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Only Excel or CSV files allowed")

    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(BytesIO(contents))
        else:
            df = pd.read_excel(BytesIO(contents))

        # Apply filter
        if req.column_filter and req.value_filter:
            df = df[df[req.column_filter] == req.value_filter]

        # Generate chart
        plt.figure(figsize=(10, 5))
        df.select_dtypes(include='number').mean().plot(kind='bar')
        plt.title("Average Values per Numeric Column")

        # Save chart to memory as Base64
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        plt.close()
        buf.seek(0)
        chart_data = base64.b64encode(buf.read()).decode('utf-8')

        # Create output Excel
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Analyzed Data', index=False)

            wb = writer.book
            ws = wb.create_sheet('Charts')

            img = XLImage(io.BytesIO(base64.b64decode(chart_data)).getvalue())
            ws.add_image(img, 'A1')

        return {
            "summary": df.describe().to_dict(),
            "output_file": base64.b64encode(output.getvalue()).decode(),
            "chart_image": chart_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))