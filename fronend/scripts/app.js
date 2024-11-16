// Khởi tạo bản đồ tại tọa độ Cần Thơ
var map = L.map('map', {
    center: [10.0292, 105.7673],
    zoom: 16
});

// Định nghĩa các lớp cơ sở (base layers)
var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});

var satelliteLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: 'Tiles courtesy of <a href="https://hot.openstreetmap.org/" target="_blank">HOT</a>'
});

// Thêm lớp OpenStreetMap làm lớp mặc định
osmLayer.addTo(map);

// Định nghĩa các lớp phủ (overlay layers)
var studioLayerGroup = L.layerGroup();
var drawnItems = new L.FeatureGroup();

// Thêm các lớp phủ vào bản đồ
studioLayerGroup.addTo(map);
drawnItems.addTo(map);

// Điều khiển lớp (base layers & overlays)
var baseLayers = {
    "Bản đồ OSM": osmLayer,
    "Bản đồ vệ tinh": satelliteLayer
};

var overlays = {
    "Các studio": studioLayerGroup,
    "Hình vẽ": drawnItems
};

// Thêm điều khiển vào bản đồ
L.control.layers(baseLayers, overlays, {
    collapsed: false // Hiển thị điều khiển không bị thu gọn
}).addTo(map);

// Định nghĩa các style cho các đối tượng
var pointStyle = L.icon({
    iconUrl: "./assets/images/icon1.png", // Đường dẫn chính xác tới icon của bạn
    shadowUrl: "./styles/css/images/marker-shadow.png",
    iconAnchor: [13, 41]
});
var lineStyle = { color: "blue", weight: 2 };
var polygonStyle = { color: "red", fillColor: "yellow", weight: 4 };


var userIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/64/64572.png', 
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
});


//chỉ đường tự chọn==========================================================================================
// Biến lưu trữ hai điểm được chọn
let startMarker = null;
let endMarker = null;
let currentRoute = null; // Đảm bảo biến currentRoute được khai báo toàn cục

// Hàm thiết lập chế độ chọn điểm trên bản đồ
function enablePointSelection(onPointSelected) {
    map.once('click', function (e) {
        const { lat, lng } = e.latlng;
        onPointSelected(lat, lng);
    });

    Swal.fire({
        icon: 'info',
        title: 'Hướng dẫn!',
        text: 'Nhấp vào một vị trí trên bản đồ để chọn điểm.',
    });
}

// Hàm chỉ đường từ hai điểm đã chọn
function calculateRouteFromPoints(startLat, startLng, endLat, endLng) {
    // Nếu đã có tuyến đường trước đó, xóa nó đi
    if (currentRoute) {
        map.removeControl(currentRoute);
    }

    // Kiểm tra tọa độ hợp lệ
    if (!isValidCoordinates(startLat, startLng) || !isValidCoordinates(endLat, endLng)) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Tọa độ không hợp lệ. Vui lòng chọn lại điểm trên bản đồ.',
        });
        return;
    }

    // Tạo tuyến đường mới
    currentRoute = L.Routing.control({
        waypoints: [
            L.latLng(startLat, startLng),
            L.latLng(endLat, endLng)
        ],
        routeWhileDragging: false,
        geocoder: L.Control.Geocoder.nominatim(),
        showAlternatives: true, // Hiển thị các tuyến đường thay thế
        altLineOptions: {
            styles: [
                { color: 'black', opacity: 0.15, weight: 9 },
                { color: 'white', opacity: 0.8, weight: 6 },
                { color: 'blue', opacity: 0.5, weight: 2 }
            ]
        }
    }).addTo(map);

    // Sự kiện khi tuyến đường được tìm thấy
    currentRoute.on('routesfound', function () {
        Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Tuyến đường đã được tính toán!',
        });
    });

    // Sự kiện khi không tìm thấy tuyến đường
    currentRoute.on('routingerror', function (e) {
        console.error('Routing error:', e);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Không thể tính toán tuyến đường. Vui lòng thử lại.',
        });
    });
}

// Kiểm tra tọa độ hợp lệ
function isValidCoordinates(lat, lng) {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// Chức năng chỉ đường từ hai điểm do người dùng chọn
function showRouteFromTwoPoints() {
    // Xóa điểm đánh dấu và tuyến đường trước đó nếu có
    if (startMarker) {
        map.removeLayer(startMarker);
        startMarker = null;
    }
    if (endMarker) {
        map.removeLayer(endMarker);
        endMarker = null;
    }
    if (currentRoute) {
        map.removeControl(currentRoute);
        currentRoute = null;
    }

    // Hiển thị thông báo và hướng dẫn người dùng
    Swal.fire({
        icon: 'info',
        title: 'Chọn điểm bắt đầu',
        text: 'Nhấp vào một vị trí trên bản đồ để chọn điểm bắt đầu.'
    }).then(() => {
        // Bước 1: Chọn điểm bắt đầu
        enablePointSelection((startLat, startLng) => {
            startMarker = L.marker([startLat, startLng], {
                icon: userIcon
            }).addTo(map).bindPopup("Điểm bắt đầu").openPopup();

            // Hiển thị thông báo cho bước tiếp theo
            Swal.fire({
                icon: 'info',
                title: 'Chọn điểm kết thúc',
                text: 'Nhấp vào một vị trí trên bản đồ để chọn điểm kết thúc.'
            }).then(() => {
                // Bước 2: Chọn điểm kết thúc
                enablePointSelection((endLat, endLng) => {
                    endMarker = L.marker([endLat, endLng], {
                        icon: userIcon
                    }).addTo(map).bindPopup("Điểm kết thúc").openPopup();

                    // Tính toán tuyến đường từ hai điểm
                    calculateRouteFromPoints(startLat, startLng, endLat, endLng);
                });
            });
        });
    });
}


// Thêm nút chỉ đường từ hai điểm vào giao diện
const routeFromTwoPointsButton = document.createElement('button');
routeFromTwoPointsButton.innerText = "Chỉ đường từ hai điểm";
routeFromTwoPointsButton.style.margin = "10px";
routeFromTwoPointsButton.style.padding = "10px";
routeFromTwoPointsButton.style.cursor = "pointer";
routeFromTwoPointsButton.style.border = "none";
routeFromTwoPointsButton.style.backgroundColor = "#007bff";
routeFromTwoPointsButton.style.color = "white";
routeFromTwoPointsButton.style.borderRadius = "5px";

// Sự kiện nhấn nút
routeFromTwoPointsButton.addEventListener('click', showRouteFromTwoPoints);


// Hàm thêm sự kiện cho nút chỉ đường từ hai điểm
// function initializeRouteButton() {
//     const routeFromTwoPointsButton = document.getElementById('route-from-two-points-btn');

//     if (routeFromTwoPointsButton) {
//         routeFromTwoPointsButton.addEventListener('click', showRouteFromTwoPoints);
//     } else {
//         console.error('Nút chỉ đường từ hai điểm không tìm thấy trên giao diện.');
//     }
// }

// Gọi hàm thêm sự kiện khi tài liệu được tải
// document.addEventListener('DOMContentLoaded', function() {
//     initializeRouteButton();
// });
//===========================================================================================================
//vẽ trên bản đồ=============================================================================================
// Hàm lưu trữ dữ liệu GeoJSON vào LocalStorage
function saveDrawnItems() {
    var data = drawnItems.toGeoJSON();
    localStorage.setItem("drawnItems", JSON.stringify(data));
    console.log("Đã lưu dữ liệu hình vẽ:", data);
}

// Hàm tải dữ liệu GeoJSON từ LocalStorage và hiển thị trên bản đồ
function loadDrawnItems() {
    var data = localStorage.getItem("drawnItems");
    if (data) {
        var geojsonLayer = L.geoJSON(JSON.parse(data), {
            onEachFeature: function(feature, layer) {
                drawnItems.addLayer(layer);
            }
        });
        map.fitBounds(drawnItems.getBounds());
        console.log("Đã tải dữ liệu hình vẽ từ LocalStorage.");
    }
}

// Thiết lập các tùy chọn cho công cụ vẽ
var drawControl = new L.Control.Draw({
    position: 'topleft',
    draw: {
        polyline: {
            shapeOptions: {
                color: '#f357a1',
                weight: 2
            }
        },
        polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
                color: '#bada55'
            }
        },
        circle: {
            shapeOptions: {
                color: '#662d91'

            }
        },
        rectangle: {
            shapeOptions: {
                color: '#fbb03b'
            }
        },
        marker: {
            icon: L.icon({
                iconUrl: './assets/images/icon2.jpg',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
            })
        }
    },
    edit: {
        featureGroup: drawnItems,
        remove: true
    }
});
map.addControl(drawControl);
// Tạo nút tùy chỉnh cho chỉ đường và thêm vào thanh công cụ
// Nút Chỉ đường từ hai điểm
L.easyButton(
    `<i class="fa fa-arrows" aria-hidden="true"></i>`,
    function () {
        showRouteFromTwoPoints(); // Gọi hàm chỉ đường
    },
    'Chỉ đường từ hai điểm' // Tooltip
).addTo(map);

// Nút Tìm Studio Gần Tôi
L.easyButton(
    `<i class="fa fa-map-marker-alt" aria-hidden="true"></i>`,
    function () {
        showSearchNearbyForm(); // Gọi hàm tìm studio gần tôi
    },
    'Tìm Studio Gần Tôi' // Tooltip
).addTo(map);

// Nút Studio Đánh Giá Cao Nhất
L.easyButton(
    `<i class="fa fa-star" aria-hidden="true"></i>`,
    function () {
        showTopRatedForm(); // Gọi hàm tìm studio đánh giá cao nhất
    },
    'Studio Đánh Giá Cao Nhất' // Tooltip
).addTo(map);

// Nút Thêm Studio Mới
L.easyButton(
    `<i class="fa fa-plus-circle" aria-hidden="true"></i>`,
    function () {
        enableAddStudioMode(); // Gọi hàm thêm studio mới
    },
    'Thêm Studio Mới' // Tooltip
).addTo(map);

// Sự kiện khi một hình dạng mới được vẽ
map.on(L.Draw.Event.CREATED, function(event) {
    var layer = event.layer;
    drawnItems.addLayer(layer);

    // Cập nhật LocalStorage mỗi khi một hình mới được vẽ
    saveDrawnItems();

    Swal.fire({
        title: 'Hình dạng đã được vẽ',
        text: 'Đã thêm một đối tượng mới vào bản đồ.',
        icon: 'success'
    });
});

// Sự kiện khi một đối tượng được chỉnh sửa
map.on(L.Draw.Event.EDITED, function(event) {
    saveDrawnItems();
    Swal.fire({
        title: 'Hình dạng đã được chỉnh sửa',
        text: 'Dữ liệu đã được cập nhật.',
        icon: 'info'
    });
});

// Sự kiện khi một đối tượng bị xóa
map.on(L.Draw.Event.DELETED, function() {
    saveDrawnItems();
    Swal.fire({
        title: 'Hình dạng đã bị xóa',
        text: 'Dữ liệu đã được cập nhật.',
        icon: 'warning'
    });
});

// Tải các đối tượng đã vẽ từ LocalStorage khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    loadDrawnItems();
});
//===========================================================================================================
// Hàm lấy và hiển thị tất cả các studio từ backend==========================================================
function loadStudios() {
    fetch('http://localhost:8080/api/studios') // URL API để lấy tất cả studio
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
// Khi trang được tải, lấy danh sách tất cả các studio và thêm vào bản đồ
document.addEventListener('DOMContentLoaded', function() {
    loadStudios();
});
//===========================================================================================================
//thêm studio mới===========================================================================================
// Hàm lấy danh sách loại studio từ API
async function fetchStudioTypes() {
    try {
        const response = await fetch('http://localhost:8080/api/studio-types');
        if (!response.ok) throw new Error('Không thể lấy danh sách loại studio.');
        return await response.json();
    } catch (error) {
        console.error('Error fetching studio types:', error);
        return [];
    }
}

// Hàm lấy danh sách quận từ API
async function fetchDistricts() {
    try {
        const response = await fetch('http://localhost:8080/api/districts');
        if (!response.ok) throw new Error('Không thể lấy danh sách quận.');
        return await response.json();
    } catch (error) {
        console.error('Error fetching districts:', error);
        return [];
    }
}

// Hàm xử lý khi nhấp vào bản đồ để chọn tọa độ
function enableAddStudioMode() {
    let selectedLatLng = null;

    Swal.fire({
        title: 'Chọn vị trí trên bản đồ',
        text: 'Nhấp vào bản đồ để chọn vị trí của studio.',
        icon: 'info',
        timer: 5000,
        showConfirmButton: false
    });

    // Bật sự kiện click để chọn tọa độ
    const onMapClick = function (e) {
        selectedLatLng = e.latlng;

        // Hiển thị form thêm studio
        map.off('click', onMapClick); // Tắt sự kiện click sau khi chọn tọa độ
        showAddStudioForm(selectedLatLng);
    };

    map.on('click', onMapClick);
}

// Hàm hiển thị form thêm studio mới sử dụng SweetAlert2
// Hàm lấy địa chỉ từ tọa độ thông qua Nominatim API
async function fetchAddressFromCoordinates(lat, lng) {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await response.json();
    return data.display_name || "Không tìm thấy địa chỉ";
}

// Hàm hiển thị form thêm studio mới với tự động điền địa chỉ
async function showAddStudioForm(selectedLatLng) {
    if (!selectedLatLng) {
        console.error("selectedLatLng không được xác định.");
        return;
    }

    // Lấy danh sách loại studio và quận
    const studioTypes = await fetchStudioTypes();
    const districts = await fetchDistricts();

    // Lấy địa chỉ từ tọa độ đã chọn
    const address = await fetchAddressFromCoordinates(selectedLatLng.lat, selectedLatLng.lng);

    // Tạo HTML cho các tùy chọn trong select
    const studioTypeOptions = studioTypes.map(
        (type) => `<option value="${type.id}">${type.name}</option>`
    ).join('');
    const districtOptions = districts.map(
        (district) => `<option value="${district.id}">${district.name}</option>`
    ).join('');

    Swal.fire({
        title: '<h4 class="text-primary mb-3">Thêm Studio Mới</h4>',
        html: `
            <style>
                .swal2-popup { width: 500px; padding: 20px; }
                .swal2-input, .swal2-select {
                    width: 100%;
                    padding: 8px;
                    border-radius: 0.25rem;
                    border: 1px solid #ced4da;
                    margin-bottom: 15px;
                }
                .swal2-html-container label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                    text-align: left;
                }
            </style>
            <div class="form-group">
                <label for="studio-name" class="form-label">Tên Studio:</label>
                <input type="text" id="studio-name-input" class="form-control" required>
            </div>
           
            <div class="form-group">
                <label for="studio-phone" class="form-label">Số Điện Thoại:</label>
                <input type="text" id="studio-phone-input" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="studio-type" class="form-label">Loại Studio:</label>
                <select id="studio-type-input" class="form-select">${studioTypeOptions}</select>
            </div>
            <div class="form-group">
                <label for="studio-district" class="form-label">Quận:</label>
                <select id="studio-district-input" class="form-select">${districtOptions}</select>
            </div>
             <div class="form-group">
                <label for="studio-address" class="form-label">Địa Chỉ:</label>
                <input type="text" id="studio-address-input" class="form-control" value="${address}" required>
            </div>
            <p class="text-muted"><b>Vị trí đã chọn:</b> Latitude: ${selectedLatLng.lat.toFixed(6)}, Longitude: ${selectedLatLng.lng.toFixed(6)}</p>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-check"></i> Thêm Studio',
        cancelButtonText: '<i class="fas fa-times"></i> Hủy',
        customClass: {
            confirmButton: 'btn btn-primary mx-1',
            cancelButton: 'btn btn-secondary mx-1'
        },
        preConfirm: () => {
            const name = Swal.getPopup().querySelector('#studio-name-input').value.trim();
            const address = Swal.getPopup().querySelector('#studio-address-input').value.trim();
            const phone = Swal.getPopup().querySelector('#studio-phone-input').value.trim();
            const studioTypeId = Swal.getPopup().querySelector('#studio-type-input').value.trim();
            const districtId = Swal.getPopup().querySelector('#studio-district-input').value.trim();

            if (!name || !address || !phone || !studioTypeId || !districtId) {
                Swal.showValidationMessage(`Vui lòng nhập đầy đủ thông tin.`);
            }

            return { name, address, phone, studioTypeId, districtId, latitude: selectedLatLng.lat, longitude: selectedLatLng.lng };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { name, address, phone, studioTypeId, districtId, latitude, longitude } = result.value;

            fetch('http://localhost:8080/api/studios', {
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
                    studioType: { id: parseInt(studioTypeId) },
                    ward: { district: { id: parseInt(districtId) } },
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
        }
    });
}
document.getElementById('add-studio-btn').addEventListener('click', enableAddStudioMode);

//===========================================================================================================
// Hàm để hiển thị popup với tọa độ và địa chỉ
function showCoordinatesAndAddressPopup(e) {
    var lat = e.latlng.lat.toFixed(6);
    var lng = e.latlng.lng.toFixed(6);

    // Tạo nội dung popup ban đầu với tọa độ
    var popupContent = `<b>Tọa độ đã chọn:</b><br>Latitude: ${lat}<br>Longitude: ${lng}<br>Đang lấy địa chỉ...`;
    var popup = L.popup()
        .setLatLng(e.latlng)
        .setContent(popupContent)
        .openOn(map);

    // Gửi yêu cầu đến API Nominatim để lấy địa chỉ
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.display_name) {
                // Cập nhật nội dung popup với địa chỉ
                popup.setContent(`<b>Tọa độ:</b><br>Vĩ độ: ${lat}<br>Kinh độ: ${lng}<br><b>Địa chỉ:</b> ${data.display_name}`);
            } else {
                popup.setContent(`<b>Tọa độ đã chọn:</b><br>Latitude: ${lat}<br>Longitude: ${lng}<br>Không tìm thấy địa chỉ.`);
            }
        })
        .catch(error => {
            console.error('Lỗi khi lấy địa chỉ:', error);
            popup.setContent(`<b>Tọa độ:</b><br>Vĩ độ: ${lat}<br>Kinh độ: ${lng}<br>Không thể lấy địa chỉ.`);
        });
}

// Thêm sự kiện click vào bản đồ để hiển thị tọa độ và địa chỉ
map.on('click', showCoordinatesAndAddressPopup);
//==========================================================================================================
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
            if (!limit || limit <= 0) {
                Swal.showValidationMessage(`Vui lòng nhập số lượng studio hợp lệ.`);
            }
            return { limit: parseInt(limit, 10) }; // Chuyển thành số nguyên
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const limit = result.value.limit;
            fetchTopRatedStudios(limit);
        }
    });
}

// Hàm tách riêng để lấy danh sách studio đánh giá cao
function fetchTopRatedStudios(rating) {
    fetch(`http://localhost:8080/api/studios/filter-by-rating?rating=${rating}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể lấy danh sách studio đánh giá cao.');
            }
            return response.json();
        })
        .then(data => {
            updateMapWithStudios(data);
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể lấy danh sách studio đánh giá cao.'
            });
        });
}

// Hàm cập nhật bản đồ với danh sách studio
function updateMapWithStudios(studios) {
    // Xóa các layer cũ
    studioLayerGroup.clearLayers();
    clickLocationLayer.clearLayers();
    nearbyFeaturesLayer.clearLayers();

    // Thêm marker mới cho các studio
    studios.forEach(studio => {
        createMarker(studio);
    });

    if (studios.length > 0) {
        // Đặt lại view tập trung vào các studio mới
        const bounds = L.latLngBounds(studios.map(studio => [studio.latitude, studio.longitude]));
        map.fitBounds(bounds);
    } else {
        Swal.fire({
            icon: 'info',
            title: 'Thông Báo!',
            text: 'Không có studio nào được tìm thấy.'
        });
    }
}

//===========================================================================================================
// Hàm lấy danh sách tên studio và thêm vào combobox
// function populateFeatureFilter() {
//     fetch('http://localhost:8080/api/studios/names')
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Không thể lấy danh sách lọc.');
//             }
//             return response.json();
//         })
//         .then(data => {
//             var filter = document.getElementById('feature-filter');
//             // Thêm tùy chọn "Tất cả"
//             var allOption = document.createElement('option');
//             allOption.value = 'all';
//             allOption.text = 'Tất cả';
//             filter.add(allOption);

//             data.forEach(name => {
//                 var option = document.createElement('option');
//                 option.value = name;
//                 option.text = name;
//                 filter.add(option);
//             });
//         })
//         .catch(error => {
//             console.error('Error loading feature filter:', error);
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Lỗi!',
//                 text: 'Không thể tải danh sách lọc.'
//             });
//         });
// }

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

// Chức năng chỉ đường từ vị trí người dùng hoặc vị trí do người dùng chọn
var routeButton = document.getElementById('route-button');
if (routeButton) {
    routeButton.addEventListener('click', function () {
        if (!selectedStudio) {
            Swal.fire({
                icon: 'warning',
                title: 'Cảnh báo!',
                text: "Vui lòng chọn một studio trên bản đồ trước."
            });
            return;
        }

        function calculateRoute(startLat, startLng) {
            // Xóa bất kỳ tuyến đường nào trước đó
            if (currentRoute) {
                map.removeControl(currentRoute);
            }

            // Tạo tuyến đường mới
            currentRoute = L.Routing.control({
                waypoints: [
                    L.latLng(startLat, startLng),
                    L.latLng(selectedStudio.latitude, selectedStudio.longitude)
                ],
                routeWhileDragging: false,
                geocoder: L.Control.Geocoder.nominatim(),
                showAlternatives: true, // Hiển thị tất cả các tuyến đường khả dụng
                altLineOptions: {
                    styles: [
                        { color: 'black', opacity: 0.15, weight: 9 },
                        { color: 'white', opacity: 0.8, weight: 6 },
                        { color: 'blue', opacity: 0.5, weight: 2 }
                    ]
                }
            }).addTo(map);

            // Đặt lại view để bao phủ tất cả các tuyến đường
            currentRoute.on('routesfound', function (e) {
                var routes = e.routes;

                // Hiển thị hộp thoại cho phép người dùng chọn tuyến đường
                let routeOptions = routes.map((route, index) => {
                    return `<option value="${index}">Tuyến ${index + 1} - ${route.summary.totalDistance / 1000} km, ${Math.round(route.summary.totalTime / 60)} phút</option>`;
                }).join('');

                Swal.fire({
                    title: 'Chọn tuyến đường',
                    html: `<select id="route-select" class="swal2-input">${routeOptions}</select>`,
                    confirmButtonText: 'Chọn',
                    preConfirm: () => {
                        const selectedRouteIndex = document.getElementById('route-select').value;
                        return parseInt(selectedRouteIndex);
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        const selectedIndex = result.value;
                        if (selectedIndex >= 0 && selectedIndex < routes.length) {
                            map.fitBounds(routes[selectedIndex].bounds);
                            Swal.fire({
                                icon: 'success',
                                title: 'Thành công!',
                                text: `Đã chọn tuyến ${selectedIndex + 1}.`
                            });
                        }
                    }
                });
            });
        }

        // Thử lấy vị trí hiện tại
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                calculateRoute(position.coords.latitude, position.coords.longitude);
            }, function (error) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Không thể lấy vị trí hiện tại!',
                    text: "Hãy chọn một vị trí bắt đầu trên bản đồ.",
                    showCancelButton: true,
                    confirmButtonText: 'Chọn vị trí',
                    cancelButtonText: 'Hủy'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Kích hoạt chế độ chọn vị trí bắt đầu
                        let startMarker;
                        map.once('click', function (e) {
                            const { lat, lng } = e.latlng;

                            if (startMarker) {
                                map.removeLayer(startMarker);
                            }

                            startMarker = L.marker([lat, lng], {
                                icon: userIcon
                            }).addTo(map).bindPopup("Vị trí bắt đầu của bạn").openPopup();

                            calculateRoute(lat, lng);
                        });

                        Swal.fire({
                            icon: 'info',
                            title: 'Hướng dẫn!',
                            text: 'Nhấp vào một vị trí trên bản đồ để chọn vị trí bắt đầu.'
                        });
                    }
                });
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Không hỗ trợ Geolocation!',
                text: "Hãy chọn một vị trí bắt đầu trên bản đồ.",
                showCancelButton: true,
                confirmButtonText: 'Chọn vị trí',
                cancelButtonText: 'Hủy'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Kích hoạt chế độ chọn vị trí bắt đầu
                    let startMarker;
                    map.once('click', function (e) {
                        const { lat, lng } = e.latlng;

                        if (startMarker) {
                            map.removeLayer(startMarker);
                        }

                        startMarker = L.marker([lat, lng], {
                            icon: userIcon
                        }).addTo(map).bindPopup("Vị trí bắt đầu của bạn").openPopup();

                        calculateRoute(lat, lng);
                    });

                    Swal.fire({
                        icon: 'info',
                        title: 'Hướng dẫn!',
                        text: 'Nhấp vào một vị trí trên bản đồ để chọn vị trí bắt đầu.'
                    });
                }
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



// Sự kiện khi thay đổi combobox lọc đối tượng
document.getElementById('feature-filter').addEventListener('change', function() {
    var selectedValue = this.value;
    var url = 'http://localhost:8080/api/studios'; 

    if (selectedValue !== 'all') {
        url += `/filter?name=${encodeURIComponent(selectedValue)}`; 
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
document.getElementById('search-nearby-btn').addEventListener('click', function (e) {
    e.preventDefault();
    showSearchNearbyForm();
});

document.getElementById('top-rated-btn').addEventListener('click', function (e) {
    e.preventDefault();
    showTopRatedForm();
});

document.getElementById('add-studio-btn').addEventListener('click', function (e) {
    e.preventDefault();
    enableAddStudioMode();
});

document.getElementById('filter-btn').addEventListener('click', function (e) {
    e.preventDefault();
    Swal.fire('Lọc Studio', 'Chức năng lọc studio sẽ được thực hiện tại đây.', 'info');
});




