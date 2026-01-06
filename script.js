document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const customInput = document.getElementById('custom-text');
    const textOverlay = document.getElementById('text-overlay');
    const colorBtns = document.querySelectorAll('.color-btn');
    const fontSelect = document.getElementById('font-select');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const cartCount = document.getElementById('cart-count');

    // State
    let cartItems = 0;

    // 1. Text Update Logic
    customInput.addEventListener('input', (e) => {
        const text = e.target.value;
        if (text.trim() === '') {
            textOverlay.innerText = 'Tên Của Bạn';
            textOverlay.style.opacity = '0.5';
        } else {
            textOverlay.innerText = text;
            textOverlay.style.opacity = '1'; // Make it more solid when typing
        }
    });

    // 2. Color Selection Logic
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            colorBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');

            // Update text color
            const color = btn.getAttribute('data-color');
            textOverlay.style.color = color;
        });
    });

    // 3. Font Selection Logic
    fontSelect.addEventListener('change', (e) => {
        textOverlay.style.fontFamily = e.target.value;
    });

    // 4. Add to Cart Logic
    addToCartBtn.addEventListener('click', () => {
        // Animation feedback
        addToCartBtn.innerHTML = `<span>Đã thêm!</span> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        addToCartBtn.style.backgroundColor = '#4CAF50';

        // Update count
        cartItems++;
        cartCount.innerText = cartItems;

        // Reset button after 2 seconds
        setTimeout(() => {
            addToCartBtn.innerHTML = `<span>Thêm vào giỏ</span> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
            addToCartBtn.style.backgroundColor = ''; // Revert to default
        }, 2000);
    });

    // 5. Modal & Checkout Logic
    const modal = document.getElementById('checkout-modal');
    const closeModal = document.querySelector('.close-modal');
    const cartIcon = document.querySelector('.cart-icon');
    const submitBtn = document.getElementById('submit-order-btn');
    const formError = document.getElementById('form-error');

    // Form Elements
    const nameInput = document.getElementById('cx-name');
    const phoneInput = document.getElementById('cx-phone');
    const addressInput = document.getElementById('cx-address');
    const fileInput = document.getElementById('cx-upload');
    const fileNameDisplay = document.getElementById('file-name');
    const fileUploadBtn = document.querySelector('.file-upload-btn');

    // Open Modal
    cartIcon.addEventListener('click', () => {
        if (cartItems === 0) {
            alert("Giỏ hàng của bạn đang trống! Hãy thiết kế một chiếc túi trước nhé.");
            return;
        }
        modal.classList.add('show');
        modal.style.display = 'flex';
    });

    // Close Modal
    closeModal.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => { modal.style.display = 'none'; }, 300);
        }
    });

    // File Upload Handling
    fileUploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name;
            validateForm();
        } else {
            fileNameDisplay.textContent = "Chưa chọn file";
            validateForm();
        }
    });

    // Validation
    function validateForm() {
        const isValid = nameInput.value.trim() !== '' &&
            phoneInput.value.trim() !== '' &&
            addressInput.value.trim() !== '' &&
            fileInput.files.length > 0;

        submitBtn.disabled = !isValid;
        return isValid;
    }

    [nameInput, phoneInput, addressInput].forEach(input => {
        input.addEventListener('input', validateForm);
    });

    // Submit Logic (Real Google Sheets)
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzH3E-Ms5Ff5QOojNIf1_xQrCmx5ApLL3Q1ydou97vjd_dDY-6_C9CWP4AMZE2gzWh8ow/exec';

    submitBtn.addEventListener('click', () => {
        if (!validateForm()) return;

        submitBtn.innerHTML = "Đang gửi đơn hàng...";
        submitBtn.disabled = true;

        const orderData = {
            orderId: 'ORD-' + Date.now(),
            customer: {
                name: nameInput.value,
                phone: phoneInput.value,
                address: addressInput.value
            },
            product: {
                text: textOverlay.innerText,
                color: textOverlay.style.color || '#333',
                font: textOverlay.style.fontFamily
            },
            paymentProof: fileInput.files[0] ? fileInput.files[0].name : "Không có file"
        };

        // Note: Using no-cors mode, we cannot read the response standardly.
        // Google Apps Script requires this for public web apps without complex CORS setup.
        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        })
            .then(() => {
                alert("Đặt hàng thành công!\nĐơn hàng đã được lưu vào hệ thống.\nChúng tôi sẽ liên hệ sớm.");

                modal.classList.remove('show');
                setTimeout(() => { modal.style.display = 'none'; }, 300);

                cartItems = 0;
                cartCount.innerText = '0';

                nameInput.value = '';
                phoneInput.value = '';
                addressInput.value = '';
                fileInput.value = '';
                fileNameDisplay.textContent = "Chưa chọn file";
                submitBtn.innerHTML = "Hoàn tất đặt hàng";
                submitBtn.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại!");
                submitBtn.innerHTML = "Hoàn tất đặt hàng";
                submitBtn.disabled = false;
            });
    });
});
