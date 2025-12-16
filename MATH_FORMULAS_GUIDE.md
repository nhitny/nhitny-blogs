# 📐 Hướng dẫn viết công thức toán học trong Blog

## 🎯 Quy tắc cơ bản:

### ✅ 3 loại nội dung:

1. **Text thường**: Không có dấu `$`
   ```
   Đây là text bình thường.
   ```

2. **Công thức inline** (trong câu): Dùng `$...$` (1 dấu $)
   ```
   Hàm dự đoán là $\hat{y}_i = w \cdot x_i + b$ với w là trọng số.
   ```

3. **Công thức block** (riêng dòng): Dùng `$$...$$` (2 dấu $)
   ```
   $$MSE = \frac{1}{N}\sum_{i=1}^{N}(\hat{y}_i - y_i)^2$$
   ```

---

## 📝 LaTeX Syntax cơ bản:

| Ký hiệu | LaTeX | Kết quả |
|---------|-------|---------|
| Mũ trên (hat) | `\hat{y}` | ŷ |
| Chỉ số dưới | `x_i` | xᵢ |
| Chỉ số trên (mũ) | `x^2` | x² |
| Phân số | `\frac{a}{b}` | a/b |
| Tổng | `\sum_{i=1}^{N}` | Σ |
| Dấu nhân | `\cdot` | · |
| Dấu nhân chéo | `\times` | × |
| Căn bậc 2 | `\sqrt{x}` | √x |
| Dấu bằng | `=` | = |
| Dấu không bằng | `\neq` | ≠ |
| Lớn hơn/nhỏ hơn | `>`, `<` | >, < |
| Lớn hơn bằng | `\geq` | ≥ |
| Nhỏ hơn bằng | `\leq` | ≤ |

---

## 💡 Ví dụ thực tế:

### Ví dụ 1: Linear Regression
```
Mô hình Linear Regression dự đoán giá trị $\hat{y}$ dựa trên công thức:

$$\hat{y}_i = w \cdot x_i + b$$

Trong đó:
- $w$ là trọng số (weight)
- $b$ là bias
- $x_i$ là giá trị đầu vào
```

### Ví dụ 2: Mean Squared Error
```
Hàm mất mát MSE được tính bằng:

$$MSE = \frac{1}{N}\sum_{i=1}^{N}(\hat{y}_i - y_i)^2$$

với $N$ là số lượng mẫu dữ liệu.
```

### Ví dụ 3: Gradient Descent
```
Công thức cập nhật trọng số trong Gradient Descent:

$$w_{new} = w_{old} - \alpha \cdot \frac{\partial L}{\partial w}$$

Trong đó $\alpha$ là learning rate.
```

---

## ⚠️ Lưu ý quan trọng:

1. **Luôn có khoảng trắng** giữa các ký hiệu: `w \cdot x` (ĐÚNG) vs `w\cdot x` (SAI)
2. **Dùng `\cdot` cho dấu nhân**, không dùng `*` hoặc `×`
3. **Dùng `\hat{}` cho mũ ^**, không dùng `^` trực tiếp
4. **Dùng `_{}` cho chỉ số dưới**, ví dụ: `x_{i+1}`
5. **Dấu $ phải đóng mở đúng**: `$...$` hoặc `$$...$$`

---

## 🎨 Trong Editor:

Khi viết bài, text có dấu `$` sẽ được **highlight màu tím nhạt** để dễ phân biệt với text thường.

---

## 🔗 Tài liệu tham khảo:

- [KaTeX Supported Functions](https://katex.org/docs/supported.html)
- [LaTeX Math Symbols](https://www.overleaf.com/learn/latex/List_of_Greek_letters_and_math_symbols)
