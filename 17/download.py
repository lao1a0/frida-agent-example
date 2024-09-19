import os
import json
import requests

# 指定要访问的URL和图片保存目录
url = "http://127.0.0.1:8000/download-images/"
image_folder = 'pic'
if not os.path.exists(image_folder):
    os.makedirs(image_folder)

# 发送GET请求到指定URL
response = requests.get(url)

# 检查HTTP响应状态码是否为200（成功）
if response.status_code == 200:
    # 解析返回的JSON数据
    movie_data = json.loads(response.text)
    
    # 确保movie_data是一个列表或可迭代对象，包含多个电影信息字典
    if isinstance(movie_data, list):
        for movie in movie_data:
            # 获取图片名称和URL
            img_name = movie['name'] + '.jpg'  # 将电影名作为图片名，并添加扩展名.jpg
            img_url = movie['cover']

            # 创建完整的目标路径
            img_path = os.path.join(image_folder, img_name)

            # 下载图片内容
            img_response = requests.get(img_url)

            # 检查图片下载响应的状态码
            if img_response.status_code == 200:
                # 将图片内容写入文件
                with open(img_path, 'wb') as f:
                    f.write(img_response.content)
                print(f"成功下载并保存图片：{img_name}")
            else:
                print(f"无法下载图片 {img_name}，响应状态码为 {img_response.status_code}")
    else:
        print("返回的数据格式错误，不是预期的电影列表。")
else:
    print(f"请求失败，响应状态码为 {response.status_code}")

