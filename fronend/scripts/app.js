var map = L.map('map', {
    center: [10.0292, 105.7673], // Tọa độ mặc định (Cần Thơ)
    zoom: 18, // Tăng mức zoom mặc định lên lớn hơn
    zoomControl: true // Hiển thị điều khiển zoom
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

map.locate({ setView: true, maxZoom: 16 });

map.on('locationfound', function(e) {
    // Thêm marker tại vị trí hiện tại
    L.marker(e.latlng, { icon: userIcon }).addTo(map)
        .bindPopup(`Vị trí của bạn: <br>Vĩ độ: ${e.latlng.lat.toFixed(6)}<br>Kinh độ: ${e.latlng.lng.toFixed(6)}`)
        .openPopup();

    console.log(`Vị trí hiện tại: Vĩ độ ${e.latlng.lat}, Kinh độ ${e.latlng.lng}`);
});

map.on('locationerror', function(e) {
    // Xử lý lỗi khi không lấy được vị trí
    alert("Không thể lấy vị trí hiện tại. Lý do: " + e.message + "\nVui lòng kiểm tra lại quyền truy cập vị trí trong trình duyệt của bạn.");

    // Tùy chọn: Đưa bản đồ về vị trí mặc định
    map.setView([10.0292, 105.7673], 16); // Quay lại tọa độ Cần Thơ

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
        // map.fitBounds(drawnItems.getBounds());
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
map.on(L.Draw.Event.CREATED, function (event) {
    const layer = event.layer;
    drawnItems.addLayer(layer);

    if (layer.toGeoJSON) {
        const geoJsonFeature = layer.toGeoJSON();
        if (geoJsonFeature.geometry.type === "Polygon" || geoJsonFeature.geometry.type === "MultiPolygon") {
            const area = calculateArea(geoJsonFeature);

            Swal.fire({
                icon: 'info',
                title: 'Diện tích',
                text: `Diện tích của hình vẽ là: ${area.toFixed(2)} km².`,
            });
        }
    }

    // Cập nhật LocalStorage
    saveDrawnItems();
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
function loadStudios(filterName = "") {
    // URL API có điều kiện lọc
    const apiUrl = `http://localhost:8080/api/studios/filter?name=${encodeURIComponent(filterName)}`;

    fetch(apiUrl) // Gửi yêu cầu đến API
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể lấy danh sách studio.');
            }
            return response.json();
        })
        .then(data => {
            studioLayerGroup.clearLayers(); // Xóa các marker cũ nếu có

            // Hiển thị danh sách studio trên bản đồ
            data.forEach(studio => {
                createMarker(studio);
            });

            console.log("Kết quả hiển thị studio:", data); // Kiểm tra kết quả từ API
        })
        .catch(error => {
            console.error('Error loading studios:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể tải danh sách studio.',
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

    // Lấy danh sách loại studio
    const studioTypes = await fetchStudioTypes();
   
    // Lấy địa chỉ từ tọa độ đã chọn
    const address = await fetchAddressFromCoordinates(selectedLatLng.lat, selectedLatLng.lng);

    // Tạo HTML cho các tùy chọn trong select
    const studioTypeOptions = studioTypes.map(
        (type) => `<option value="${type.id}">${type.name}</option>`
    ).join('');
  
    Swal.fire({
        title: '<h4 class="text-primary mb-3">Thêm Studio Mới</h4>',
        html: `
            <style>
              /* Điều chỉnh cỡ chữ và khoảng cách */
    .swal2-popup {
        width: 500px;
        padding: 20px;
    }
    .swal2-input, .swal2-select, .form-control, .form-select {
        width: 100%;
        padding: 8px;
        border-radius: 0.25rem;
        border: 1px solid #ced4da;
        margin-bottom: 20px; /* Tăng khoảng cách giữa các form group */
        font-size: 16px; /* Cỡ chữ 16px */
    }
    .swal2-html-container label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        text-align: left;
        font-size: 16px; /* Cỡ chữ 16px */
    }
    .form-group {
        margin-bottom: 20px; /* Tăng khoảng cách giữa các form group */
    }
    .text-muted {
        font-size: 14px; /* Cỡ chữ nhỏ hơn cho thông tin bổ sung */
        margin-top: 10px;
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
                <label for="studio-address" class="form-label">Địa Chỉ:</label>
                <input type="text" id="studio-address-input" class="form-control" value="${address}" required>
            </div>
            <p class="text-muted"><b>Vị trí đã chọn:</b> vĩ độ: ${selectedLatLng.lat.toFixed(6)}, kinh độ : ${selectedLatLng.lng.toFixed(6)}</p>
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
           
            if (!name || !address || !phone || !studioTypeId ) {
                Swal.showValidationMessage(`Vui lòng nhập đầy đủ thông tin.`);
            }

            return { name, address, phone, studioTypeId,  latitude: selectedLatLng.lat, longitude: selectedLatLng.lng };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { name, address, phone, studioTypeId, latitude, longitude } = result.value;
        
            // Kiểm tra các giá trị đầu vào trước khi gửi
            if (!name || !address || !phone || !studioTypeId  || !latitude || !longitude) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Cảnh báo!',
                    text: 'Vui lòng nhập đầy đủ thông tin trước khi thêm studio.'
                });
                return;
            }
        
            // Gửi dữ liệu tới API
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
                    studioType: { id: parseInt(studioTypeId) }, // Loại studio
                    rating: 0 // Mặc định rating là 0
                })
            })
            .then(response => {
                // Kiểm tra phản hồi từ server
                if (!response.ok) {
                    return response.json().then(error => {
                        throw new Error(error.message || 'Không thể thêm studio mới.');
                    });
                }
                return response.json();
            })
            .then(newStudio => {
                // Thêm marker vào bản đồ sau khi thêm thành công
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
                    text: error.message || 'Không thể thêm studio mới.'
                });
            });
        }
        
    });
}
//===========================================================================================================
// Hàm để hiển thị popup với tọa độ và địa chỉ
function showCoordinatesAndAddressPopup(e) {
    var lat = e.latlng.lat.toFixed(6);
    var lng = e.latlng.lng.toFixed(6);

    // Tạo nội dung popup ban đầu với tọa độ
    var popupContent = `<b>Tọa độ đã chọn:</b><br>Vĩ độ: ${lat}<br>Kinh độ: ${lng}<br>Đang lấy địa chỉ...`;
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
                popup.setContent(`<b>Tọa độ đã chọn:</b><br>Vĩ độ: ${lat}<br>Kinh độ: ${lng}<br>Không tìm thấy địa chỉ.`);
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
            <label for="top-rated-limit">Đánh giá từ:</label>
            <input type="number" id="top-rated-limit" class="swal2-input" min="1" value="5" max="5">
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
    // clickLocationLayer.clearLayers();
    // nearbyFeaturesLayer.clearLayers();

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
// Hàm hiển thị chi tiết studio
function showStudioDetail(studioId) {
    fetch(`http://localhost:8080/api/studios/${studioId}`) // API lấy chi tiết studio
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể lấy dữ liệu studio.');
            }
            return response.json();
        })
        .then(studio => {
            // Hiển thị thông tin studio
            document.getElementById('studio-name').innerText = studio.name;

            // Hiển thị hình ảnh thumbnail
            const imagesDiv = document.getElementById('studio-images');
            imagesDiv.innerHTML = '';
            if (studio.thumbnail) {
                const thumbnailImage = document.createElement('img');
                thumbnailImage.src = `http://localhost:8080/api/images/view/${studio.thumbnail}`;
                thumbnailImage.alt = studio.name;
                thumbnailImage.id = 'thumbnail-image';
                imagesDiv.appendChild(thumbnailImage);

                // Thêm sự kiện click vào thumbnail
                thumbnailImage.addEventListener('click', function () {
                    showStudioImages(studioId, studio.name); // Hiển thị danh sách ảnh
                });
            } else {
                console.log('Studio không có ảnh thumbnail.');
            }

            // Hiển thị địa chỉ
            document.getElementById('studio-address').innerHTML = `<strong>Địa chỉ:</strong> ${studio.address}`;

            // Hiển thị số điện thoại
            document.getElementById('studio-phone').innerHTML = `<strong>Số điện thoại:</strong> ${studio.phone}`;

            // Hiển thị đánh giá
            const ratingText = studio.rating === 0 ? "Chưa có đánh giá" : `${studio.rating}⭐`;
            document.getElementById('studio-rating').innerHTML = `<strong>Đánh giá:</strong> ${ratingText}`;

            // Hiển thị modal
            const modal = document.getElementById('studio-detail');
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

// Hàm hiển thị danh sách ảnh
function showStudioImages(studioId, studioName) {
    fetch(`http://localhost:8080/api/images/studio/${studioId}`) // API lấy danh sách ảnh
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể lấy danh sách ảnh.');
            }
            return response.json();
        })
        .then(images => {
            // Tạo modal hiển thị danh sách ảnh
            const modalImages = document.createElement('div');
            modalImages.id = 'modal-images';
            modalImages.style.display = 'flex';
            modalImages.style.flexWrap = 'wrap';
            modalImages.style.justifyContent = 'center';
            modalImages.style.alignItems = 'center';
            modalImages.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            modalImages.style.position = 'fixed';
            modalImages.style.top = '0';
            modalImages.style.left = '0';
            modalImages.style.width = '100%';
            modalImages.style.height = '100%';
            modalImages.style.overflow = 'auto';
            modalImages.style.zIndex = '1000';
            modalImages.style.padding = '20px';

            // Nếu không có ảnh, hiển thị nút thêm ảnh
            if (images.length === 0) {
                const addImageButton = createAddImageButton(studioId);
                modalImages.appendChild(addImageButton);
            } else {
                // Hiển thị danh sách ảnh
                images.forEach(image => {
                    const img = document.createElement('img');
                    img.src = `http://localhost:8080/api/images/view/${image.imageUrl}`;
                    img.alt = `Ảnh từ studio ${studioId}`;
                    img.style.width = '200px';
                    img.style.margin = '10px';
                    img.style.borderRadius = '8px';
                    img.style.cursor = 'pointer';
                    modalImages.appendChild(img);
                });

                // Thêm nút thêm ảnh sau danh sách ảnh
                const addImageButton = createAddImageButton(studioId);
                modalImages.appendChild(addImageButton);
            }

            // Đóng modal khi click bên ngoài
            modalImages.addEventListener('click', function (event) {
                if (event.target === modalImages) {
                    modalImages.remove(); // Xóa modal khỏi DOM
                }
            });

            document.body.appendChild(modalImages); // Thêm modal vào body
        })
        .catch(error => {
            console.error('Error fetching images:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể lấy danh sách ảnh.'
            });
        });
}

// Hàm tạo nút thêm ảnh
function createAddImageButton(studioId) {
    const addImageButton = document.createElement('div');
    addImageButton.innerHTML = '+';
    addImageButton.style.width = '50px';
    addImageButton.style.height = '50px';
    addImageButton.style.display = 'flex';
    addImageButton.style.justifyContent = 'center';
    addImageButton.style.alignItems = 'center';
    addImageButton.style.borderRadius = '50%';
    addImageButton.style.backgroundColor = '#007bff';
    addImageButton.style.color = '#fff';
    addImageButton.style.fontSize = '24px';
    addImageButton.style.cursor = 'pointer';
    addImageButton.style.marginTop = '20px';
    addImageButton.addEventListener('click', function () {
        showAddImageForm(studioId); // Gọi hàm thêm ảnh
    });
    return addImageButton;
}

// Hàm hiển thị form thêm ảnh
function showAddImageForm(studioId) {
    Swal.fire({
        title: 'Thêm ảnh mới',
        html: `
            <input type="file" id="image-upload" accept="image/*" class="swal2-input" multiple>
        `,
        showCancelButton: true,
        confirmButtonText: 'Thêm',
        preConfirm: () => {
            const fileInput = document.getElementById('image-upload');
            if (!fileInput.files || fileInput.files.length === 0) {
                Swal.showValidationMessage('Vui lòng chọn ít nhất một tệp hình ảnh.');
                return false;
            }
            return Array.from(fileInput.files); // Trả về danh sách tệp ảnh
        }
    }).then(result => {
        if (result.isConfirmed) {
            const files = result.value;

            // Tạo FormData để gửi dữ liệu
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            // Gửi API thêm ảnh
            fetch(`http://localhost:8080/api/images/studio/${studioId}`, {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Không thể thêm ảnh.');
                    }
                    return response.json();
                })
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công!',
                        text: 'Ảnh đã được thêm thành công.'
                    });

                    // Làm mới danh sách ảnh
                    document.querySelector('#modal-images').remove();
                    showStudioImages(studioId); // Làm mới modal hiển thị danh sách ảnh
                })
                .catch(error => {
                    console.error('Error uploading images:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi!',
                        text: 'Không thể thêm ảnh.'
                    });
                });
        }
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
                    return `<option value="${index}">Tuyến ${index + 1} - ${(route.summary.totalDistance / 1000).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km, ${Math.round(route.summary.totalTime / 60)} phút</option>`;

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

//=====================================================================================================================
// Hàm hiển thị form tìm kiếm gần tôi sử dụng SweetAlert2
var clickLocationLayer = L.layerGroup().addTo(map);
var nearbyFeaturesLayer = L.layerGroup().addTo(map); // Lớp để lưu các studio gần
var bufferLayer = null; // Biến để lưu buffer hiện tại

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
            return { radius: parseFloat(radius) };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            var radius = result.value.radius;
            if (radius) {
                // Lấy vị trí hiện tại của người dùng
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        var userLat = position.coords.latitude;
                        var userLng = position.coords.longitude;

                        // Fetch studios gần vị trí người dùng
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
                                if (bufferLayer) {
                                    map.removeLayer(bufferLayer);
                                }

                                // Vẽ buffer (vùng bán kính)
                                bufferLayer = L.circle([userLat, userLng], {
                                    radius: radius * 1000, // Chuyển từ km sang mét
                                    color: 'blue',
                                    fillColor: '#add8e6',
                                    fillOpacity: 0.3
                                }).addTo(map);

                                // Thêm marker cho vị trí người dùng
                                var userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(clickLocationLayer);
                                userMarker.bindPopup("Vị trí của bạn").openPopup();

                                // Thêm marker cho các studio gần
                                if (data.length > 0) {
                                    data.forEach(studio => {
                                        var marker = L.marker([studio.latitude, studio.longitude], {
                                            icon: L.icon({
                                                iconUrl: './assets/images/highlight.png', // Thay bằng icon nổi bật
                                                iconSize: [30, 40],
                                                iconAnchor: [15, 40]
                                            })
                                        }).addTo(nearbyFeaturesLayer);

                                        marker.bindPopup(`
                                            <b>${studio.name}</b><br>
                                            ${studio.address}<br>
                                            Đánh giá: ${studio.rating || 'Chưa có đánh giá'}
                                        `);
                                    });

                                    // Đặt lại view để bao quát tất cả studio
                                    var bounds = L.latLngBounds(data.map(studio => [studio.latitude, studio.longitude]));
                                    bounds.extend([userLat, userLng]); // Bao gồm cả vị trí người dùng
                                    map.fitBounds(bounds);
                                } else {
                                    Swal.fire({
                                        icon: 'info',
                                        title: 'Không có studio nào gần bạn!',
                                        text: 'Vui lòng thử lại với bán kính lớn hơn.'
                                    });
                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Lỗi!',
                                    text: 'Không thể tìm kiếm studio gần bạn.'
                                });
                            });
                    }, function (error) {
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


//====================================tính khoảng cách===============================================================
L.easyButton(
    `<i class="fa fa-ruler-horizontal" aria-hidden="true"></i>`,
    function () {
        enableDistanceMeasurement();
    },
    'Tính khoảng cách giữa hai điểm'
).addTo(map);
// L.easyButton(
//     `<i class="fa fa-times-circle" aria-hidden="true"></i>`,
//     function () {
//         clearDistanceMarkers(); // Gọi hàm xóa các điểm
//     },
//     'Xóa các điểm đã chọn'
// ).addTo(map);
let point1 = null;
let point2 = null;
let distanceMarkers = []; // Lưu trữ các marker đã thêm


// Hàm tính khoảng cách giữa hai điểm (Haversine Formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Tính khoảng cách (km)
    return distance;
}

document.getElementById("searchBox").addEventListener("input", function (e) {
    const searchTerm = e.target.value.trim(); // Lấy từ khóa tìm kiếm

    if (searchTerm) {
        loadStudios(searchTerm); // Gọi hàm loadStudios với từ khóa tìm kiếm
    } else {
        loadStudios(); // Nếu từ khóa rỗng, tải toàn bộ studio
    }
});


// Hàm xóa các điểm đã chọn
function clearDistanceMarkers() {
    distanceMarkers.forEach(marker => map.removeLayer(marker)); // Xóa tất cả marker
    distanceMarkers = []; // Xóa mảng marker
    point1 = null;
    point2 = null;

    Swal.fire({
        icon: 'info',
        title: 'Điểm đã chọn đã bị xóa',
        text: 'Bạn đã xóa các điểm tính khoảng cách.',
    });
}

// Hàm tắt chế độ tính khoảng cách
function disableDistanceCalculation() {
    map.off('click'); // Hủy sự kiện click
    clearDistanceMarkers(); // Xóa các điểm đã chọn
    Swal.fire({
        icon: 'info',
        title: 'Tính khoảng cách đã bị tắt',
        text: 'Các điểm đã chọn cũng đã bị xóa.',
    });
}

// Hàm bật chế độ tính khoảng cách
function enableDistanceMeasurement() {
    Swal.fire({
        icon: 'info',
        title: 'Chọn điểm đầu tiên',
        text: 'Nhấp vào bản đồ để chọn điểm đầu tiên.'
    }).then(() => {
        map.once('click', function (e) {
            point1 = e.latlng;

            const marker1 = L.marker([point1.lat, point1.lng])
                .addTo(map)
                .bindPopup("Điểm đầu tiên").openPopup();

            distanceMarkers.push(marker1); // Lưu lại marker

            Swal.fire({
                icon: 'info',
                title: 'Chọn điểm thứ hai',
                text: 'Nhấp vào bản đồ để chọn điểm thứ hai.'
            }).then(() => {
                map.once('click', function (e) {
                    point2 = e.latlng;

                    const marker2 = L.marker([point2.lat, point2.lng])
                        .addTo(map)
                        .bindPopup("Điểm thứ hai").openPopup();

                    distanceMarkers.push(marker2); // Lưu lại marker

                    // Tính khoảng cách giữa hai điểm
                    const distance = calculateDistance(point1.lat, point1.lng, point2.lat, point2.lng);

                    // Hiển thị kết quả
                    Swal.fire({
                        icon: 'success',
                        title: 'Khoảng cách',
                        text: `Khoảng cách giữa hai điểm là: ${distance.toFixed(2)} km.`,
                    }).then(() => {
                        clearDistanceMarkers(); // Xóa các điểm sau khi hiển thị
                    });
                });
            });
        });
    });
}

//======================================================================================================================

//=========================Tính diện tích===============================================================================
// Hàm tính diện tích cho hình vẽ (polygon hoặc multipolygon)
function calculateArea(geoJsonFeature) {
    const area = turf.area(geoJsonFeature); // Diện tích tính bằng mét vuông
    const areaInKm2 = area / 1_000_00; // Chuyển đổi sang km²
    return areaInKm2;
}

// Thêm sự kiện click vào các layer để tính diện tích
drawnItems.on('click', function (e) {
    const layer = e.layer;
    if (layer.toGeoJSON) {
        const geoJsonFeature = layer.toGeoJSON();
        if (geoJsonFeature.geometry.type === "Polygon" || geoJsonFeature.geometry.type === "MultiPolygon") {
            const area = calculateArea(geoJsonFeature);

            Swal.fire({
                icon: 'info',
                title: 'Diện tích',
                text: `Diện tích của hình vẽ là: ${area.toFixed(2)} km².`,
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Không phải là hình đa giác',
                text: 'Chỉ có thể tính diện tích cho hình đa giác.',
            });
        }
    }
});
//==================================================================================================================
//=================================tải xuống dữ liệu GeoJSON từ các hình vẽ trên bản đồ.============================
// Hàm xuất dữ liệu GeoJSON
function exportToGeoJSON() {
    // Lấy dữ liệu từ các hình đã vẽ
    const data = drawnItems.toGeoJSON();

    // Chuyển dữ liệu sang định dạng JSON
    const json = JSON.stringify(data);

    // Tạo một file và tải xuống
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Tạo liên kết để tải file
    const a = document.createElement("a");
    a.href = url;
    a.download = "shapes.geojson";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    Swal.fire({
        icon: "success",
        title: "Xuất GeoJSON thành công!",
        text: "File GeoJSON đã được tải xuống.",
    });
}

// Thêm nút xuất GeoJSON vào thanh công cụ
L.easyButton(
    `<i class="fa fa-download" aria-hidden="true"></i>`,
    exportToGeoJSON,
    "Xuất GeoJSON"
).addTo(map);
//=======================Thêm từ file json==============================================================================
// Tạo nút "Nạp JSON" trên thanh công cụ
L.easyButton(
    `<i class="fa fa-upload"></i>`, // Biểu tượng của nút (FontAwesome)
    () => {
        // Kích hoạt input file để chọn tệp JSON
        document.getElementById('jsonFileInput').click();
    },
    "Nạp dữ liệu từ JSON" // Tooltip khi di chuột
).addTo(map);
// Xử lý sự kiện khi người dùng chọn tệp JSON
document.getElementById('jsonFileInput').addEventListener('change', function (event) {
    const file = event.target.files[0]; // Lấy tệp được chọn

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                const geojsonData = JSON.parse(e.target.result); // Parse nội dung JSON
                loadGeoJsonData(geojsonData); // Gọi hàm để hiển thị dữ liệu
            } catch (error) {
                console.error('Lỗi khi đọc tệp JSON:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể đọc tệp JSON. Định dạng không hợp lệ.',
                });
            }
        };

        reader.readAsText(file); // Đọc nội dung tệp
    }
});

// Hàm hiển thị dữ liệu GeoJSON lên bản đồ
// Hàm hiển thị dữ liệu GeoJSON lên bản đồ
function loadGeoJsonData(geojsonData) {
    try {
        // Xóa các layer cũ
        drawnItems.clearLayers();

        // Thêm dữ liệu GeoJSON vào layer
        L.geoJSON(geojsonData, {
            onEachFeature: function (feature, layer) {
                if (feature.properties) {
                    layer.bindPopup(
                        `<pre>${JSON.stringify(feature.properties, null, 2)}</pre>`
                    );
                }
                drawnItems.addLayer(layer); // Thêm vào nhóm hình vẽ
            },
        });

        // Đặt bản đồ focus vào dữ liệu được nạp
        map.fitBounds(drawnItems.getBounds());

        Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Dữ liệu từ tệp JSON đã được nạp lên bản đồ.',
        });
    } catch (error) {
        console.error('Lỗi khi hiển thị dữ liệu GeoJSON:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Không thể hiển thị dữ liệu từ tệp JSON.',
        });
    }
}

