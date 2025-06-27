# Quy trình tạo hóa đơn xét nghiệm

## Tổng quan
Hệ thống đã được cập nhật để tự động tạo hóa đơn khi xét nghiệm có trạng thái COMPLETED. Sau khi hoàn thành tất cả xét nghiệm, có thể tạo hóa đơn cuối cùng với giảm giá.

## Quy trình mới

### Bước 1: Tạo xét nghiệm
- Tạo xét nghiệm với trạng thái PENDING
- Xét nghiệm được liên kết với dịch vụ cụ thể

### Bước 2: Hoàn thành xét nghiệm
- Khi cập nhật trạng thái xét nghiệm thành **COMPLETED**
- Hệ thống **tự động tạo PatientBills** cho dịch vụ xét nghiệm đó
- Mỗi xét nghiệm có số lượng = 1 và đơn giá từ bảng Services

### Bước 3: Tạo hóa đơn cuối cùng
- **Nút**: "Tạo hóa đơn cuối"
- **Chức năng**: 
  - Hiển thị danh sách xét nghiệm đã hoàn thành
  - Tính tổng tiền các xét nghiệm đã hoàn thành
  - Nhập giảm giá (%)
  - Chọn ngày tạo hóa đơn
  - Áp dụng giảm giá cho tổng tiền

### Bước 4: Xem hóa đơn đã tạo
- Hiển thị tất cả dịch vụ xét nghiệm đã hoàn thành
- Tổng tiền dịch vụ được tính tự động
- Có thể xóa từng dịch vụ nếu cần

## Các thay đổi kỹ thuật

### 1. Action updateLabTest (CẬP NHẬT)
- Khi trạng thái = "COMPLETED" → tự động gọi `createBillForCompletedLabTest`
- Tạo PatientBills với quantity = 1 và unit_cost từ Services
- Cập nhật tổng tiền Payment

### 2. Hàm createBillForCompletedLabTest (MỚI)
- Kiểm tra và tạo Payment nếu chưa có
- Kiểm tra tránh tạo duplicate PatientBills
- Tự động tính và cập nhật tổng tiền

### 3. Component BillsContainer (CẬP NHẬT)
- Lấy danh sách xét nghiệm đã hoàn thành thay vì tất cả dịch vụ
- Hiển thị hướng dẫn phù hợp với quy trình mới
- Chỉ hiển thị nút "Tạo hóa đơn cuối"

### 4. Component GenerateFinalBills (CẬP NHẬT)
- Nhận `completedLabTests` thay vì `servicesData`
- Hiển thị danh sách xét nghiệm đã hoàn thành
- Gọi action `generateBillWithCompletedTests`

### 5. Action generateBillWithCompletedTests (MỚI)
- Tính tổng tiền từ các xét nghiệm đã hoàn thành
- Áp dụng giảm giá cho tổng tiền
- Cập nhật Payment và đánh dấu appointment COMPLETED

## Lợi ích

1. **Tự động hóa**: Hóa đơn được tạo tự động khi xét nghiệm hoàn thành
2. **Chính xác**: Chỉ tính tiền cho các xét nghiệm thực tế đã thực hiện
3. **Linh hoạt**: Có thể hoàn thành xét nghiệm theo thứ tự bất kỳ
4. **Kiểm soát**: Có thể xem trước và áp dụng giảm giá trước khi tạo hóa đơn cuối
5. **Tránh duplicate**: Hệ thống kiểm tra và tránh tạo hóa đơn trùng lặp

## Lưu ý

- Hóa đơn chỉ được tạo cho các xét nghiệm có trạng thái "COMPLETED"
- Mỗi xét nghiệm có số lượng = 1
- Có thể xóa từng dịch vụ sau khi tạo hóa đơn
- Giảm giá được áp dụng cho tổng tiền các xét nghiệm đã hoàn thành
- Appointment sẽ được đánh dấu là COMPLETED sau khi tạo hóa đơn cuối

## Quy trình chi tiết

### Khi tạo xét nghiệm:
1. Tạo LabTest với status = "PENDING"
2. Chưa có hóa đơn nào được tạo

### Khi hoàn thành xét nghiệm:
1. Cập nhật LabTest status = "COMPLETED"
2. Tự động tạo PatientBills cho dịch vụ xét nghiệm
3. Cập nhật tổng tiền Payment

### Khi tạo hóa đơn cuối:
1. Hiển thị danh sách xét nghiệm đã hoàn thành
2. Nhập giảm giá (%)
3. Áp dụng giảm giá cho tổng tiền
4. Đánh dấu appointment COMPLETED

## Dữ liệu mẫu

Khi có 3 xét nghiệm hoàn thành:

| Xét nghiệm | Trạng thái | Đơn giá | Thành tiền |
|------------|------------|---------|------------|
| Xét nghiệm máu | COMPLETED | $15 | $15 |
| Xét nghiệm nước tiểu | COMPLETED | $10 | $10 |
| Xét nghiệm glucose | COMPLETED | $8 | $8 |
| **Tổng cộng** | | | **$33** |
| **Giảm giá 10%** | | | **-$3.30** |
| **Phải trả** | | | **$29.70** | 