FROM python:3.11-slim

WORKDIR /app

RUN sed -i 's/deb.debian.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's/deb.debian.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apt/sources.list

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 1. BƯỚC ĐẢO NGƯỢC: Cài PyTorch (cực nặng, hiếm khi đổi) TRƯỚC TIÊN
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# 2. BÂY GIỜ MỚI COPY danh sách thư viện vào (hay đổi)
COPY requirements.txt .

# 3. Cài các thư viện trong danh sách (sẽ chạy rất nhanh nếu có thêm httpx)
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]