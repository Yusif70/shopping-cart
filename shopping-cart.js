const cartBtn = document.querySelector(".cart-btn");
const clearCartBtn = document.querySelector(".btn-clear");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".total-value");
const cartContent = document.querySelector(".cart-list");
const productsDOM = document.querySelector("#products-dom");

let buttonsDOM = [];
let cart = [];
class Products {
  async getProducts() {
    try {
      let result = await fetch(
        "https://640873e52f01352a8a933dde.mockapi.io/products"
      );
      let data = await result.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
          <div class="col-lg-4 col-md-6">
            <div class="product">
              <div class="product-image">
                <img src=${product.image} alt="product" />
              </div>
              <div class="product-hover">
                <span class="product-title">${product.title}</span>
                <span class="product-price">$ ${product.price}</span>
                <button class="btn-add-to-cart" data-id=${product.id}>
                  <i class="fas fa-cart-shopping"></i>
                </button>
              </div>
            </div>
          </div>
       `;
    });
    productsDOM.innerHTML = result;
  }

  getButtons() {
    const buttons = [...document.querySelectorAll(".btn-add-to-cart")];
    buttonsDOM = buttons;
    buttonsDOM.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.target.classList.add("disabled");
        e.target.style.opacity = ".3";
        let cartItem = {
          amount: 1,
          ...Storage.getProduct(button.dataset.id),
        };
        cart = [...cart, cartItem];
        Storage.saveCart(cart);
        this.setCartValues(cart);
        this.setCart(cart);
        this.showCart();
        let inCart = cart.find((item) => item.id === button.dataset.id);
        if (!inCart) {
          button.classList.remove("disabled");
        }
      });
    });
  }

  setCartValues(cart) {
    let totalPrice = 0;
    let totalItems = 0;
    cart.map((item) => {
      totalPrice += item.price * item.amount;
      totalItems += item.amount;
    });

    cartTotal.innerText = `$ ${parseFloat(totalPrice.toFixed(2))}`;
    cartItems.innerText = totalItems;
  }
  setCart(cart) {
    let result = "";
    cart.forEach((item) => {
      result += `
            <li class="cart-list-item">
              <div class="cart-left">
                <div class="cart-left-image">
                  <img src=${item.image} alt="product" />
                </div>
                <div class="cart-left-info">
                  <a class="cart-left-info-title" href="#">${item.title}</a>
                  <span class="cart-left-info-price">$ ${item.price}</span>
                </div>
              </div>
              <div class="cart-right">
                <div class="cart-right-quantity">
                  <button class="quantity-minus" data-id=${item.id}>
                    <i class="fas fa-minus"></i>
                  </button>
                  <span class="quantity">${item.amount}</span>
                  <button class="quantity-plus" data-id=${item.id}>
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
                <div class="cart-right-remove">
                  <button class="cart-remove-btn" data-id=${item.id}>
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </li>`;
    });
    cartContent.innerHTML = result;
  }
  showCart() {
    cartBtn.click();
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      cart = [];
      this.setCart(cart);
      this.setCartValues(cart);
      Storage.saveCart(cart);
    });

    cartContent.addEventListener("click", (e) => {
      if (e.target.classList.contains("quantity-minus")) {
        let currentItem = cart.find((item) => item.id == e.target.dataset.id);
        if (currentItem.amount > 1) {
          currentItem.amount -= 1;
          this.setCartValues(cart);
          this.setCart(cart);
        } else {
          let filteredCart = cart.filter((item) => item.id !== currentItem.id);
          cart = [...filteredCart];
          this.setCart(cart);
          this.setCartValues(cart);
          Storage.saveCart(cart);
        }
      } else if (e.target.classList.contains("quantity-plus")) {
        let currentItem = cart.find((item) => item.id == e.target.dataset.id);
        currentItem.amount += 1;
        this.setCartValues(cart);
        this.setCart(cart);
      } else if (e.target.classList.contains("cart-remove-btn")) {
        e.target.parentElement.parentElement.parentElement.remove();
        let removeItem = cart.find((item) => item.id == e.target.dataset.id);
        let filteredCart = cart.filter((item) => item.id !== removeItem.id);
        cart = [...filteredCart];
        this.setCart(cart);
        this.setCartValues(cart);
        Storage.saveCart(cart);
      }
    });
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((item) => item.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();

  const products = new Products();
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getButtons();
      ui.cartLogic();
    });
});
