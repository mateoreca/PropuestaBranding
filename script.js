const productos = [
  { id: 1, nombre: "Hoodie 'Black Street'", categoria: "Hoodies", precio: 120000, imagen: "https://m.media-amazon.com/images/I/B1mEhjGJ2nL._CLa%7C2140%2C2000%7CB1QfPC6SWpL.png%7C0%2C0%2C2140%2C2000%2B0.0%2C0.0%2C2140.0%2C2000.0_AC_SX466_.png" },
  { id: 2, nombre: "Hoodie 'Retro Gray'", categoria: "Hoodies", precio: 115000, imagen: "https://hourscollection.com/cdn/shop/files/DropShoulderHoodie-VintageGrey-ClipTag2_700x.png?v=1735840181" },
  { id: 3, nombre: "Gorra 'NYC Flat'", categoria: "Gorras", precio: 75000, imagen: "https://neweraco.vtexassets.com/arquivos/ids/234059/60428321_1.jpg?v=638941559902130000" },
  { id: 4, nombre: "Gorra 'Classic White'", categoria: "Gorras", precio: 70000, imagen: "https://www.hurlintongco.com/wp-content/uploads/1-6.webp" },
  { id: 5, nombre: "Buso Oversize 'Storm'", categoria: "Busos oversize", precio: 95000, imagen: "https://acdn-us.mitiendanube.com/stores/004/414/333/products/img_7565-359a4c7f908f20c6c017412665759992-1024-1024.webp" },
  { id: 6, nombre: "Buso Oversize 'Skyline'", categoria: "Busos oversize", precio: 99000, imagen: "https://andamishop.co/cdn/shop/files/skyline_1.jpg?v=1714151361&width=1200" }
];

const formatoCOP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' });
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const contenedorProductos = document.getElementById("productos");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total");
const filtro = document.getElementById("filtro-categoria");
const paymentArea = document.getElementById("payment-area");
const confirmMsg = document.getElementById("confirm-msg");
const paypalContainer = document.getElementById("paypal-button-container");

function mostrarProductos(categoriaSeleccionada = "todas") {
  contenedorProductos.innerHTML = "";
  const productosFiltrados =
    categoriaSeleccionada === "todas"
      ? productos
      : productos.filter(p => p.categoria === categoriaSeleccionada);

  productosFiltrados.forEach(prod => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p>Precio: ${formatoCOP.format(prod.precio)}</p>
      <p>Categoría: ${prod.categoria}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    contenedorProductos.appendChild(div);
  });
}

filtro.addEventListener("change", e => mostrarProductos(e.target.value));

function agregarAlCarrito(id) {
  const productoExistente = carrito.find(p => p.id === id);
  if (productoExistente) {
    productoExistente.cantidad++;
  } else {
    const producto = productos.find(p => p.id === id);
    carrito.push({ ...producto, cantidad: 1 });
  }
  actualizarCarrito();
}

function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;
  let totalItems = 0;

  carrito.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.nombre} x${item.cantidad} - ${formatoCOP.format(item.precio * item.cantidad)}`;
    listaCarrito.appendChild(li);
    total += item.precio * item.cantidad;
    totalItems += item.cantidad;
  });

  totalCarrito.textContent = formatoCOP.format(total);
  document.querySelector(".carrito h2").textContent = `🛒 Carrito de Compras (${totalItems})`;
  localStorage.setItem("carrito", JSON.stringify(carrito));

  paypalContainer.style.display = total > 0 ? "block" : "none";
}

function vaciarCarrito() {
  if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
    carrito = [];
    localStorage.removeItem("carrito");
    actualizarCarrito();
  }
}

document.getElementById("finalizar").addEventListener("click", () => {
  if (carrito.length === 0) {
    alert("El carrito está vacío. Agrega productos antes de finalizar la compra.");
    return;
  }
  paymentArea.style.display = "block";
});

function simularPago() {
  confirmMsg.style.display = "block";
  carrito = [];
  localStorage.removeItem("carrito");
  actualizarCarrito();
  setTimeout(() => {
    confirmMsg.style.display = "none";
    paymentArea.style.display = "none";
  }, 3000);
}

if (window.paypal) {
  paypal.Buttons({
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [{ amount: { value: (carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0) / 4000).toFixed(2) } }]
      });
    },
    onApprove: (data, actions) => {
      return actions.order.capture().then(() => {
        confirmMsg.style.display = "block";
        carrito = [];
        localStorage.removeItem("carrito");
        actualizarCarrito();
        setTimeout(() => {
          confirmMsg.style.display = "none";
          paymentArea.style.display = "none";
        }, 3000);
      });
    }
  }).render('#paypal-button-container');
}

mostrarProductos();
actualizarCarrito();
