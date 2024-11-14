// Khởi tạo bản đồ tại tọa độ Cần Thơ
var map = L.map('map').setView([10.0452, 105.7469], 13);

// Thêm tile layer từ OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Định nghĩa các style cho point, line và polygon
var pointStyle = L.icon({
    iconUrl: "path_to_your_icon/marker-icon.png", // Thay bằng đường dẫn chính xác tới icon của bạn
    shadowUrl: "path_to_your_icon/marker-shadow.png", // Thay bằng đường dẫn chính xác tới shadow icon
    iconAnchor: [13, 41]
});
var lineStyle = { color: "blue", weight: 2 };
var polygonStyle = { color: "red", fillColor: "yellow", weight: 4 };

// LayerGroup để chứa các đối tượng studio
var studioLayerGroup = L.layerGroup().addTo(map);

// LayerGroup để chứa điểm nhấp và các đối tượng tìm thấy
var clickLocationLayer = L.layerGroup().addTo(map);
var nearbyFeaturesLayer = L.layerGroup().addTo(map);

// Biến lưu trữ tuyến đường hiện tại
var currentRoute = null;

// Biến lưu trữ studio được chọn để chỉ đường
var selectedStudio = null;

// Icon cho người dùng
var userIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/64/64572.png', 
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
});

// Hàm lấy và hiển thị tất cả các studio từ backend
function loadStudios() {
    fetch('http://localhost:8080/api/studios') // Thay đổi URL nếu cần
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể lấy danh sách studio.');
            }
            return response.json();
        })
        .then(data => {
            studioLayerGroup.clearLayers(); // Xóa các layer cũ nếu có
            data.forEach(studio => {
                createMarker(studio);
            });
        })
        .catch(error => {
            console.error('Error loading studios:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể tải danh sách studio.'
            });
        });
}

// Hàm lấy danh sách tên studio và thêm vào combobox
function populateFeatureFilter() {
    fetch('http://localhost:8080/api/studios/names') // Endpoint để lấy danh sách tên studio
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể lấy danh sách lọc.');
            }
            return response.json();
        })
        .then(data => {
            var filter = document.getElementById('feature-filter');
            // Thêm tùy chọn "Tất cả"
            var allOption = document.createElement('option');
            allOption.value = 'all';
            allOption.text = 'Tất cả';
            filter.add(allOption);

            data.forEach(name => {
                var option = document.createElement('option');
                option.value = name;
                option.text = name;
                filter.add(option);
            });
        })
        .catch(error => {
            console.error('Error loading feature filter:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể tải danh sách lọc.'
            });
        });
}

// Hàm tạo marker và thêm vào layerGroup
function createMarker(studio) {
    if (!studio.latitude || !studio.longitude) {
        console.warn(`Studio ${studio.name} không có tọa độ.`);
        return;
    }

    var marker = L.marker([studio.latitude, studio.longitude], { icon: pointStyle }).addTo(studioLayerGroup);
    marker.bindPopup(`<b>${studio.name}</b><br>${studio.address}`);

    // Sự kiện khi click vào marker
    marker.on('click', function() {
        showStudioDetail(studio.id);
        selectedStudio = studio;
    });

    console.log(`Marker cho studio ${studio.name} đã được thêm vào bản đồ.`);
}

// Hàm hiển thị chi tiết studio trong modal
function showStudioDetail(studioId) {
    fetch(`http://localhost:8080/api/studios/${studioId}`) // Endpoint để lấy chi tiết studio
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể lấy dữ liệu studio.');
            }
            return response.json();
        })
        .then(studio => {
            document.getElementById('studio-name').innerText = studio.name;
            document.getElementById('studio-address').innerText = `Địa chỉ: ${studio.address}`;
            document.getElementById('studio-phone').innerText = `Số điện thoại: ${studio.phone}`;
            document.getElementById('studio-rating').innerText = `Đánh giá: ${studio.rating}`;

            // Hiển thị hình ảnh
            var imagesDiv = document.getElementById('studio-images');
            imagesDiv.innerHTML = '';
            if (studio.images && studio.images.length > 0) {
                studio.images.forEach(image => {
                    var img = document.createElement('img');
                    img.src = image.imageUrl;
                    img.alt = studio.name;
                    img.style.width = '100px';
                    img.style.margin = '5px';
                    imagesDiv.appendChild(img);
                });
            } else {
                imagesDiv.innerHTML = '<p>Không có hình ảnh.</p>';
            }

            // Hiển thị đánh giá
            var reviewsDiv = document.getElementById('studio-reviews');
            reviewsDiv.innerHTML = '';
            if (studio.reviews && studio.reviews.length > 0) {
                studio.reviews.forEach(review => {
                    var reviewP = document.createElement('p');
                    reviewP.innerHTML = `<strong>${review.rating} sao:</strong> ${review.comment}`;
                    reviewsDiv.appendChild(reviewP);
                });
            } else {
                reviewsDiv.innerHTML = '<p>Không có đánh giá.</p>';
            }

            // Hiển thị modal
            var modal = document.getElementById('studio-detail');
            modal.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching studio details:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể lấy chi tiết studio.'
            });
        });
}

// Đóng modal khi nhấp vào nút đóng
var closeButton = document.querySelector('.close-button');
if (closeButton) { // Kiểm tra tồn tại trước khi thêm sự kiện
    closeButton.addEventListener('click', function() {
        var modal = document.getElementById('studio-detail');
        modal.style.display = 'none';
    });
}

// Đóng modal khi nhấp ngoài vùng modal
window.onclick = function(event) {
    var modal = document.getElementById('studio-detail');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Chức năng chỉ đường từ vị trí người dùng đến studio được chọn
var routeButton = document.getElementById('route-button');
if (routeButton) { // Kiểm tra tồn tại trước khi thêm sự kiện
    routeButton.addEventListener('click', function() {
        if (!selectedStudio) {
            Swal.fire({
                icon: 'warning',
                title: 'Cảnh báo!',
                text: "Vui lòng chọn một studio trên bản đồ trước."
            });
            return;
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var userLat = position.coords.latitude;
                var userLng = position.coords.longitude;

                // Xóa bất kỳ tuyến đường nào trước đó
                if (currentRoute) {
                    map.removeControl(currentRoute);
                }

                // Tạo tuyến đường mới
                currentRoute = L.Routing.control({
                    waypoints: [
                        L.latLng(userLat, userLng),
                        L.latLng(selectedStudio.latitude, selectedStudio.longitude)
                    ],
                    routeWhileDragging: false,
                    geocoder: L.Control.Geocoder.nominatim(),
                    show: true
                }).addTo(map);

                // Đặt lại view để bao phủ tuyến đường
                currentRoute.on('routesfound', function(e) {
                    var routes = e.routes;
                    if (routes.length > 0) {
                        map.fitBounds(routes[0].bounds);
                    }
                });
            }, function(error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: "Không thể lấy vị trí của bạn."
                });
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: "Trình duyệt của bạn không hỗ trợ Geolocation."
            });
        }
    });
}

// Hàm hiển thị form tìm kiếm gần tôi sử dụng SweetAlert2
function showSearchNearbyForm() {
    Swal.fire({
        title: 'Tìm Studio Gần Tôi',
        html: `
            <label for="search-radius">Bán kính (km):</label>
            <input type="number" id="search-radius" class="swal2-input" min="1" value="5">
        `,
        showCancelButton: true,
        confirmButtonText: 'Tìm',
        preConfirm: () => {
            const radius = Swal.getPopup().querySelector('#search-radius').value;
            if (!radius) {
                Swal.showValidationMessage(`Vui lòng nhập bán kính tìm kiếm.`);
            }
            return { radius: radius };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            var radius = result.value.radius;
            if (radius) {
                // Lấy vị trí hiện tại của người dùng
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        var userLat = position.coords.latitude;
                        var userLng = position.coords.longitude;

                        fetch(`http://localhost:8080/api/studios/nearby?latitude=${userLat}&longitude=${userLng}&radius=${radius}`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Không thể tìm kiếm studio gần bạn.');
                                }
                                return response.json();
                            })
                            .then(data => {
                                // Xóa các layer cũ
                                clickLocationLayer.clearLayers();
                                nearbyFeaturesLayer.clearLayers();

                                // Thêm marker cho vị trí người dùng
                                var userMarker = L.marker([userLat, userLng], {icon: userIcon}).addTo(clickLocationLayer);
                                userMarker.bindPopup("Vị trí của bạn").openPopup();

                                // Thêm marker mới cho các studio gần
                                data.forEach(studio => {
                                    createMarker(studio);
                                });

                                // Đặt lại view về vị trí người dùng
                                map.setView([userLat, userLng], 13);
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Lỗi!',
                                    text: 'Không thể tìm kiếm studio gần bạn.'
                                });
                            });
                    }, function(error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi!',
                            text: "Không thể lấy vị trí của bạn."
                        });
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi!',
                        text: "Trình duyệt của bạn không hỗ trợ Geolocation."
                    });
                }
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Cảnh báo!',
                    text: 'Vui lòng nhập bán kính tìm kiếm.'
                });
            }
        }
    });
}

// Hàm hiển thị form studio đánh giá cao nhất sử dụng SweetAlert2
function showTopRatedForm() {
    Swal.fire({
        title: 'Studio Đánh Giá Cao Nhất',
        html: `
            <label for="top-rated-limit">Số lượng:</label>
            <input type="number" id="top-rated-limit" class="swal2-input" min="1" value="10">
        `,
        showCancelButton: true,
        confirmButtonText: 'Hiển Thị',
        preConfirm: () => {
            const limit = Swal.getPopup().querySelector('#top-rated-limit').value;
            if (!limit) {
                Swal.showValidationMessage(`Vui lòng nhập số lượng studio.`);
            }
            return { limit: limit };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            var limit = result.value.limit;
            if (limit) {
                fetch(`http://localhost:8080/api/studios/top-rated?limit=${limit}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Không thể lấy danh sách studio đánh giá cao.');
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Xóa các layer cũ
                        studioLayerGroup.clearLayers();
                        clickLocationLayer.clearLayers();
                        nearbyFeaturesLayer.clearLayers();

                        // Thêm marker mới cho các studio đánh giá cao
                        data.forEach(studio => {
                            createMarker(studio);
                        });

                        // Đặt lại view về vị trí Cần Thơ
                        map.setView([10.0452, 105.7469], 13);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi!',
                            text: 'Không thể lấy danh sách studio đánh giá cao.'
                        });
                    });
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Cảnh báo!',
                    text: 'Vui lòng nhập số lượng.'
                });
            }
        }
    });
}

// Hàm hiển thị form thêm studio mới sử dụng SweetAlert2
function showAddStudioForm() {
    Swal.fire({
        title: 'Thêm Studio Mới',
        html: `
            <label for="studio-name">Tên Studio:</label>
            <input type="text" id="studio-name-input" class="swal2-input" required>
            <label for="studio-address">Địa Chỉ:</label>
            <input type="text" id="studio-address-input" class="swal2-input" required>
            <label for="studio-phone">Số Điện Thoại:</label>
            <input type="text" id="studio-phone-input" class="swal2-input" required>
            <label for="studio-type">Loại Studio:</label>
            <input type="text" id="studio-type-input" class="swal2-input" required>
        `,
        showCancelButton: true,
        confirmButtonText: 'Thêm Studio',
        preConfirm: () => {
            const name = Swal.getPopup().querySelector('#studio-name-input').value.trim();
            const address = Swal.getPopup().querySelector('#studio-address-input').value.trim();
            const phone = Swal.getPopup().querySelector('#studio-phone-input').value.trim();
            const type = Swal.getPopup().querySelector('#studio-type-input').value.trim();

            if (!name || !address || !phone || !type) {
                Swal.showValidationMessage(`Vui lòng nhập đầy đủ thông tin.`);
            }
            return { name, address, phone, type };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            var { name, address, phone, type } = result.value;

            // Lấy vị trí từ địa chỉ bằng Geocoding (sử dụng Nominatim)
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        var latitude = parseFloat(data[0].lat);
                        var longitude = parseFloat(data[0].lon);
                        // Gửi yêu cầu thêm studio đến backend
                        fetch('http://localhost:8080/api/studios', { // Thay đổi URL nếu cần
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                name: name,
                                address: address,
                                latitude: latitude,
                                longitude: longitude,
                                phone: phone,
                                type: type,
                                rating: 0
                            })
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Không thể thêm studio mới.');
                            }
                            return response.json();
                        })
                        .then(newStudio => {
                            createMarker(newStudio);
                            Swal.fire({
                                icon: 'success',
                                title: 'Thành công!',
                                text: 'Thêm studio mới thành công!'
                            });
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            Swal.fire({
                                icon: 'error',
                                title: 'Lỗi!',
                                text: 'Không thể thêm studio mới.'
                            });
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi!',
                            text: 'Không tìm thấy địa chỉ. Vui lòng kiểm tra lại.'
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi!',
                        text: 'Không thể thực hiện Geocoding.'
                    });
                });
        }
    });
}

// Hàm tìm kiếm các đối tượng trong khoảng cách
function findFeaturesWithinDistance(latlng, distance) {
    fetch(`http://localhost:8080/api/studios/nearby?latitude=${latlng.lat}&longitude=${latlng.lng}&radius=${distance}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tìm kiếm các studio trong khoảng cách.');
            }
            return response.json();
        })
        .then(data => {
            // Xóa các layer cũ
            clickLocationLayer.clearLayers();
            nearbyFeaturesLayer.clearLayers();

            // Thêm marker cho vị trí nhấp
            var clickMarker = L.marker([latlng.lat, latlng.lng]).addTo(clickLocationLayer);
            clickMarker.bindPopup("Vị trí chọn").openPopup();

            // Thêm marker mới cho các studio gần
            data.forEach(studio => {
                createMarker(studio);
            });
        })
        .catch(error => {
            console.error('Error searching nearby features:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể tìm kiếm các studio trong khoảng cách.'
            });
        });
}

// Khi trang được tải, lấy danh sách tất cả các studio và thêm vào bản đồ
document.addEventListener('DOMContentLoaded', function() {
    populateFeatureFilter();
    loadStudios();
});

// Sự kiện khi thay đổi combobox lọc đối tượng
document.getElementById('feature-filter').addEventListener('change', function() {
    var selectedValue = this.value;
    var url = 'http://localhost:8080/api/studios'; // Endpoint mặc định

    if (selectedValue !== 'all') {
        url += `/filter?name=${encodeURIComponent(selectedValue)}`; // Endpoint để lọc theo tên
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu đã lọc.');
            }
            return response.json();
        })
        .then(data => {
            studioLayerGroup.clearLayers(); // Xóa các layer cũ
            data.forEach(studio => {
                createMarker(studio);
            });
        })
        .catch(error => {
            console.error('Error loading filtered data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể tải dữ liệu đã lọc.'
            });
        });
});

// Sự kiện khi click vào các nút chức năng
document.getElementById('search-nearby-btn').addEventListener('click', function() {
    showSearchNearbyForm();
});

document.getElementById('top-rated-btn').addEventListener('click', function() {
    showTopRatedForm();
});

document.getElementById('add-studio-btn').addEventListener('click', function() {
    showAddStudioForm();
});
