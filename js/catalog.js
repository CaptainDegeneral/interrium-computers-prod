// ═══════════════════════════════════════════════════════════════════════════════
// МОДУЛЬ: catalog.js
// ═══════════════════════════════════════════════════════════════════════════════
// 
// НАЗНАЧЕНИЕ СУЩНОСТИ:
// Этот файл содержит всю логику страницы каталога (/catalog.html).
// Он отвечает за:
// - Загрузку списка товаров (через loadProducts из data.js).
// - Отображение товаров в виде карточек (product cards).
// - Фильтрацию товаров (по поиску, категории, бренду, цене).
// - Сортировку (по цене, названию).
// - Пагинацию (разбиение на страницы по 6 товаров).
// - Динамическое обновление интерфейса при изменении фильтров.
// - Обработку кликов "В корзину" прямо из каталога.
// 
// КАК ИСПОЛЬЗУЕТСЯ В ПРОЕКТЕ:
// - Подключается только на странице catalog.html (после main.js, modal.js, data.js).
// - Вызывает loadProducts() из data.js.
// - Вызывает addToCart() из main.js (при клике на кнопки в карточках).
// - Использует showToast() косвенно через addToCart.
// - Обновляет updateCartBadge() через addToCart.
// 
// ЗАДАЧА, КОТОРУЮ РЕШАЕТ:
// Предоставить пользователю удобный интерфейс для просмотра и фильтрации большого списка компьютеров.
// Реализовать клиентскую (в браузере) фильтрацию и пагинацию без перезагрузки страницы.
// Сделать каталог интерактивным и отзывчивым.
// 
// ОСОБЕННОСТИ РЕАЛИЗАЦИИ:
// - ВСЯ фильтрация, сортировка и пагинация происходит на клиенте (в JavaScript).
// - Используется один глобальный массив allProducts (источник правды).
// - Объект filters хранит текущее состояние всех фильтров.
// - Функция applyFilters() — сердце модуля: она каждый раз пересоздаёт отфильтрованный список и вызывает render.
// - Много слушателей событий (input, change, click) — реактивный UI.
// - Использует data-атрибуты (data-id, data-add-cart, data-page) для связи HTML и JS.
// - Нет серверной части — всё в браузере (для простоты учебного проекта).
// 
// ВЗАИМОСВЯЗЬ С ДРУГИМИ ЧАСТЯМИ:
// - Зависит от: loadProducts (data.js), addToCart и showToast (main.js).
// - Предоставляет: функциональность каталога.
// - catalog.html содержит разметку (.catalog__grid, .filters, .pagination и т.д.).
// - CSS (catalog.css, adaptive.css) отвечает за внешний вид.
// - При добавлении в корзину данные уходят в localStorage и становятся доступны на cart.html.
// 
// УРОВЕНЬ ДЕТАЛИЗАЦИИ ДЛЯ СТУДЕНТОВ:
// Комментарии объясняют:
// - что такое состояние (state) в приложении;
// - как работает реактивное обновление UI;
// - разницу между .filter(), .map(), .forEach(), .find(), .slice(), .sort();
// - что такое data-атрибуты и dataset;
// - как работают события input/change/click;
// - почему мы пересчитываем фильтры заново при каждом изменении (простота);
// - как работает пагинация математически;
// - особенности работы с ценами (Number, toLocaleString).
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ СОСТОЯНИЯ (State)
// ═══════════════════════════════════════════════════════════════════════════════

// let allProducts = [];
// 
// ЧТО ХРАНИТ:
// Массив всех товаров, загруженных из JSON. Это "источник правды" (single source of truth).
// Никогда не фильтруется напрямую — мы всегда копируем его при фильтрации.
// 
// ПОЧЕМУ let, а не const:
// Значение меняется один раз — в initCatalog() после загрузки данных.
// После этого массив не переприсваивается, но его содержимое (объекты) используется.
// 
// ТИП: Array of objects. Каждый объект — товар с полями id, title, brand, price, image, stock, category, specs и т.д.
// 
// ВЛИЯНИЕ:
// Используется во всех функциях фильтрации, рендеринга и обработки кликов.
let allProducts = [];

// let currentPage = 1;
// 
// Текущая страница пагинации (начиная с 1).
// Меняется при:
// - нажатии на кнопки пагинации;
// - применении фильтров (сбрасывается на 1, чтобы не показывать пустую страницу).
// 
// Используется в renderProducts() для вычисления slice(start, end).
let currentPage = 1;

// const productsPerPage = 6;
// 
// Константа — сколько товаров показывать на одной странице.
// 6 — выбрано для удобного отображения в сетке (вероятно 2-3 колонки).
// Если изменить — пагинация автоматически адаптируется.
// 
// const — не меняется никогда.
const productsPerPage = 6;

// const filters = { ... };
// 
// ОБЪЕКТ СОСТОЯНИЯ ФИЛЬТРОВ.
// Это центральное место, где хранится текущее состояние всех фильтров пользователя.
// 
// СВОЙСТВА:
// - search: string — текст из поля поиска (trim'ированный).
// - sort: string — "default", "price-asc", "price-desc", "title-asc".
// - category: string[] — массив выбранных категорий (["gaming", "office"]).
// - brand: string[] — массив выбранных брендов.
// - maxPrice: number — максимальная цена (из range input), Infinity по умолчанию.
// 
// ПОЧЕМУ ОДИН ОБЪЕКТ:
// Удобно передавать/читать состояние целиком.
// Легко сбрасывать (в кнопке "Сбросить").
// При любом изменении мы читаем из этого объекта в applyFilters().
// 
// ИЗМЕНЕНИЯ:
// Происходят в обработчиках событий (input, change, click reset).
// После изменения обычно вызывается applyFilters() и currentPage = 1.
const filters = {
  search: "",
  sort: "default",
  category: [],
  brand: [],
  maxPrice: Infinity,
};

// ═══════════════════════════════════════════════════════════════════════════════
// КЭШИРОВАНИЕ DOM-ЭЛЕМЕНТОВ (DOM References)
// ═══════════════════════════════════════════════════════════════════════════════
// 
// Мы выполняем document.querySelector / querySelectorAll ОДИН РАЗ при загрузке скрипта.
// Результаты сохраняем в переменные.
// 
// ЗАЧЕМ:
// - Производительность: querySelector — относительно дорогая операция (обход дерева DOM).
// - Читаемость: catalogGrid вместо document.querySelector(".catalog__grid") везде.
// - Избежание ошибок: если элемент отсутствует, мы проверим один раз в начале.
// 
// ВАЖНО:
// Эти запросы выполняются СРАЗУ при парсинге скрипта (до DOMContentLoaded!).
// На момент выполнения catalog.html уже загружен (скрипт в конце body), 
// поэтому элементы уже существуют в DOM.
// Если бы скрипт был в <head>, нам пришлось бы ждать DOMContentLoaded.

const catalogGrid = document.querySelector(".catalog__grid");
const catalogCount = document.querySelector(".catalog__count");
const searchInput = document.querySelector(".catalog__search input");
const sortSelect = document.querySelector(".catalog__sort");
const priceRange = document.querySelector(".catalog__price");
const priceOutput = document.querySelector(".catalog__price-output");
const resetButton = document.querySelector(".catalog__reset");
const filtersForm = document.querySelector(".filters");
const pagination = document.querySelector(".pagination");
const sidebar = document.querySelector(".catalog__sidebar");
const filterToggle = document.querySelector(".catalog__filter-toggle");
const applyButton = document.querySelector("[data-apply-filters]");

// ═══════════════════════════════════════════════════════════════════════════════
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: formatPrice(price)
// ═══════════════════════════════════════════════════════════════════════════════
// 
// НАЗНАЧЕНИЕ:
// Превращает число цены в красивую строку с разделителями тысяч и символом рубля.
// Пример: 189900 → "189 900 ₽"
// 
// КАКИЕ ДАННЫЕ ПРИНИМАЕТ:
// price — число (number) или что-то, что можно привести к числу.
// 
// КАКИЕ ДАННЫЕ ВОЗВРАЩАЕТ:
// Строка.
// 
// КАК ИСПОЛЬЗУЕТСЯ:
// В createProductCard() и в других местах рендеринга.
// 
// ПОЧЕМУ ОТДЕЛЬНАЯ ФУНКЦИЯ:
// Логика форматирования цен используется в нескольких местах (каталог, корзина, товар).
// Чтобы не дублировать код и легко менять формат в одном месте.
// 
// ОСОБЕННОСТИ:
// - Number(price) — на случай, если придёт строка.
// - toLocaleString("ru-RU") — встроенный метод Number.
//   Форматирует число согласно локали России: пробелы как разделители тысяч, запятая для дробной части.
// - Шаблонная строка `${...} ₽` — современный способ конкатенации строк (ES6).
function formatPrice(price) {
  // Number(price) — глобальная функция приведения к числу.
  // toLocaleString("ru-RU") — метод Number.prototype.
  //   Принимает строку локали.
  //   Возвращает отформатированную строку.
  //   Для 189900 в "ru-RU" → "189 900"
  return `${Number(price).toLocaleString("ru-RU")} ₽`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ: createProductCard(product)
// ═══════════════════════════════════════════════════════════════════════════════
// 
// НАЗНАЧЕНИЕ:
// Генерирует HTML-строку для одной карточки товара.
// Эта строка позже будет вставлена в .catalog__grid через innerHTML.
// 
// КАКИЕ ДАННЫЕ ПРИНИМАЕТ:
// product — объект товара (из allProducts или отфильтрованного списка).
// 
// КАКИЕ ДАННЫЕ ВОЗВРАЩАЕТ:
// Строка, содержащая валидный HTML для <article class="product-card">...</article>.
// 
// КАК ИСПОЛЬЗУЕТСЯ:
// В renderProducts(): pageProducts.map(createProductCard).join("")
// 
// ЗАДАЧА:
// Отделить генерацию разметки карточки от логики рендеринга списка.
// Сделать код более читаемым.
// 
// ОСОБЕННОСТИ:
// - Использует шаблонные строки (template literals) с ${} для вставки данных.
// - Вставляет data-атрибуты: data-id и data-add-cart.
// - Условный класс badge в зависимости от stock (boolean).
// - loading="lazy" на img — нативная ленивая загрузка изображений.
// - Кнопка "В корзину" имеет type="button" (чтобы не сабмитить форму) и data-add-cart.
// 
// ВАЖНО ДЛЯ БЕЗОПАСНОСТИ (учебно):
// В реальном проекте с пользовательским вводом мы бы НЕ использовали innerHTML + шаблонные строки напрямую
// (риск XSS). Здесь данные приходят из нашего trusted JSON, поэтому безопасно.
function createProductCard(product) {
  // Возвращаем большую шаблонную строку.
  // Всё, что внутри ` ... ` — это один большой литерал строки.
  // ${выражение} — интерполяция: значение выражения вставляется как текст.
  return `<article class="product-card" data-id="${product.id}">
    <img src="${product.image}" alt="${product.title}" loading="lazy" />
    <span class="badge ${product.stock ? "badge--success" : "badge--muted"}">${product.stock ? "В наличии" : "Под заказ"}</span>
    <h3>${product.title}</h3>
    <p>${product.brand}</p>
    <strong>${formatPrice(product.price)}</strong>
    <div class="product-card__actions">
      <a class="btn btn--outline" href="product.html?id=${product.id}">Подробнее</a>
      <button class="btn btn--primary" type="button" data-add-cart="${product.id}">В корзину</button>
    </div>
  </article>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ: renderPagination(total)
// ═══════════════════════════════════════════════════════════════════════════════
// 
// НАЗНАЧЕНИЕ:
// Генерирует кнопки пагинации (1, 2, 3, ..., Следующая) и вставляет их в .pagination.
// Если страниц 1 или меньше — очищает контейнер.
// 
// КАКИЕ ДАННЫЕ ПРИНИМАЕТ:
// total — общее количество товаров после фильтрации (number).
// 
// КАКИЕ ДАННЫЕ ВОЗВРАЩАЕТ:
// Ничего (побочный эффект — изменение innerHTML элемента pagination).
// 
// КАК ИСПОЛЬЗУЕТСЯ:
// Вызывается из renderProducts() после отрисовки товаров.
// 
// ЗАДАЧА:
// Показать пользователю, на какой странице он находится, и дать возможность перейти на другие.
// 
// ОСОБЕННОСТИ:
// - Математика: Math.ceil(total / productsPerPage)
// - Цикл for для генерации кнопок страниц.
// - Условно добавляет кнопку "Следующая", если не на последней странице.
// - Использует data-page атрибут для идентификации кнопки при клике (см. обработчик ниже).
// - Добавляет класс "active" текущей странице.
function renderPagination(total) {
  // Если контейнер пагинации отсутствует на странице — ничего не делаем.
  if (!pagination) return;

  // Вычисляем общее количество страниц.
  // Math.ceil — глобальный математический метод.
  // Округляет число ВВЕРХ до ближайшего целого.
  // Пример: Math.ceil(7 / 6) = Math.ceil(1.166) = 2
  const pages = Math.ceil(total / productsPerPage);

  // Если страниц 1 или 0 — пагинация не нужна. Очищаем контейнер и выходим.
  if (pages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  // Создаём массив строк (HTML кнопок).
  const buttons = [];

  // Цикл for — классическая конструкция для повторения действий известное количество раз.
  // for (инициализация; условие; шаг) { тело }
  // 
  // Здесь:
  //   let page = 1;           — начинаем с первой страницы
  //   page <= pages;          — продолжаем, пока не пройдём все страницы
  //   page += 1               — после каждой итерации увеличиваем page на 1
  for (let page = 1; page <= pages; page += 1) {
    // Добавляем в массив buttons строку с HTML-кнопкой.
    // Тернарный оператор: если page === currentPage — добавляем класс "active".
    // data-page="${page}" — очень важный data-атрибут. Позже в обработчике клика
    // мы прочитаем его через button.dataset.page
    buttons.push(
      `<button type="button" class="${page === currentPage ? "active" : ""}" data-page="${page}">${page}</button>`,
    );
  }

  // Если текущая страница меньше последней — добавляем кнопку "Следующая".
  if (currentPage < pages) {
    buttons.push(
      `<button type="button" data-page="${currentPage + 1}">Следующая</button>`,
    );
  }

  // Соединяем все строки в одну большую строку и вставляем в DOM.
  // Array.prototype.join(separator) — метод массива.
  // Соединяет все элементы массива в строку, используя separator между ними.
  // join("") — без разделителя.
  // 
  // innerHTML = ... — свойство Element.
  // Полностью заменяет содержимое элемента на новый HTML (парсится браузером).
  // Это самый простой (но не самый эффективный) способ динамически создавать много элементов.
  pagination.innerHTML = buttons.join("");
}

// ═══════════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ: renderProducts(products)
// ═══════════════════════════════════════════════════════════════════════════════
// 
// НАЗНАЧЕНИЕ:
// Отрисовывает список товаров в .catalog__grid.
// Обновляет текст "Найдено: X товаров".
// Если товаров нет — показывает сообщение "Товары не найдены".
// Вызывает renderPagination.
// 
// КАКИЕ ДАННЫЕ ПРИНИМАЕТ:
// products — массив товаров, которые нужно показать (уже отфильтрованные и отсортированные).
// 
// КАКИЕ ДАННЫЕ ВОЗВРАЩАЕТ:
// Ничего (побочные эффекты на DOM).
// 
// КАК ИСПОЛЬЗУЕТСЯ:
// Вызывается из applyFilters() и из initCatalog().
// 
// ЗАДАЧА:
// Единственная функция, которая напрямую меняет содержимое каталога.
// 
// ОСОБЕННОСТИ:
// - catalogCount.textContent — обновление текста.
// - Пагинация: вычисляем start = (currentPage-1)*productsPerPage
// - .slice(start, start + productsPerPage) — берём только товары для текущей страницы.
// - .map(createProductCard).join("") — превращаем массив товаров в одну HTML-строку.
// - innerHTML — вставка.
function renderProducts(products) {
  // Если контейнер сетки отсутствует — выходим (защита).
  if (!catalogGrid) return;

  // Обновляем счётчик найденных товаров.
  // catalogCount.textContent — см. объяснение в main.js (textContent).
  catalogCount.textContent = `Найдено: ${products.length} товаров`;

  // Если после фильтрации товаров не осталось — показываем специальное сообщение.
  if (products.length === 0) {
    catalogGrid.innerHTML =
      '<div class="catalog__empty">Товары не найдены</div>';
    // Обновляем пагинацию (0 товаров → нет кнопок).
    renderPagination(0);
    return;
  }

  // Вычисляем индекс первого товара на текущей странице.
  // Пример: currentPage=1 → start=0
  //         currentPage=2 → start=6 (если productsPerPage=6)
  const start = (currentPage - 1) * productsPerPage;

  // Берём только товары для текущей страницы.
  // 
  // Array.prototype.slice(begin, end):
  // Метод массива.
  // Возвращает НОВЫЙ массив, содержащий элементы с индекса begin (включительно)
  // до end (НЕ включительно).
  // Оригинальный массив НЕ изменяется.
  // 
  // pageProducts — это "окно" из products длиной до productsPerPage элементов.
  const pageProducts = products.slice(start, start + productsPerPage);

  // Превращаем массив товаров в массив HTML-строк с помощью .map(),
  // затем соединяем их в одну строку с .join("").
  // 
  // Array.prototype.map(callback):
  // Создаёт НОВЫЙ массив, где каждый элемент — результат вызова callback для соответствующего элемента оригинала.
  // 
  // Здесь: .map(createProductCard) → для каждого товара вызывает createProductCard(товар)
  // и собирает результаты в новый массив строк.
  // 
  // .join("") — соединяет строки без разделителей.
  // 
  // Результат — одна большая строка HTML, которую мы вставляем.
  catalogGrid.innerHTML = pageProducts.map(createProductCard).join("");

  // Обновляем кнопки пагинации (им нужно знать общее количество товаров).
  renderPagination(products.length);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ: applyFilters()
// ═══════════════════════════════════════════════════════════════════════════════
// 
// НАЗНАЧЕНИЕ:
// ГЛАВНАЯ функция модуля. Применяет все активные фильтры, сортировку и пагинацию
// к копии allProducts и вызывает renderProducts с результатом.
// 
// КАК РАБОТАЕТ (ПОШАГОВО):
// 1. Делает копию всего списка: let result = [...allProducts];
// 2. Если есть поиск — фильтрует по title и brand (toLowerCase + includes).
// 3. Если выбраны категории — фильтрует по category.
// 4. Если выбраны бренды — фильтрует по brand.
// 5. Всегда фильтрует по maxPrice.
// 6. Применяет сортировку (если не "default").
// 7. Корректирует currentPage, если она стала недействительной.
// 8. Вызывает renderProducts(result).
// 
// ПОЧЕМУ КАЖДЫЙ РАЗ С НУЛЯ:
// Простота. Не нужно отслеживать "какие фильтры уже применены".
// Для небольшого количества товаров (сотни) это абсолютно приемлемо.
// В больших приложениях использовали бы более умные структуры (например, индексы).
// 
// ВАЖНО:
// Эта функция — единственное место, где происходит фильтрация.
// Все обработчики событий просто меняют объект filters и вызывают applyFilters().
function applyFilters() {
  // Создаём копию массива allProducts.
  // 
  // Синтаксис spread [...array] — современный способ (ES6) создать поверхностную копию массива.
  // Мы НЕ хотим мутировать оригинальный allProducts.
  // Каждый раз начинаем с полного списка.
  let result = [...allProducts];

  // === ФИЛЬТР ПО ПОИСКУ ===
  // Если в filters.search есть текст (не пустая строка) —
  if (filters.search) {
    // Приводим поисковый запрос к нижнему регистру один раз.
    // toLowerCase() — метод String.prototype.
    // Нужен для регистронезависимого поиска.
    const query = filters.search.toLowerCase();

    // Array.prototype.filter(callback):
    // Создаёт НОВЫЙ массив, содержащий только те элементы оригинала,
    // для которых callback вернул truthy значение.
    // 
    // Здесь callback:
    // (product) => product.title.toLowerCase().includes(query) || product.brand.toLowerCase().includes(query)
    // 
    // String.prototype.includes(substring):
    // Возвращает true, если строка содержит указанную подстроку.
    // 
    // Логика: оставляем товар, если его название ИЛИ бренд содержат поисковый запрос.
    result = result.filter(
      (product) =>
        product.title.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query),
    );
  }

  // === ФИЛЬТР ПО КАТЕГОРИИ ===
  // Если пользователь выбрал хотя бы одну категорию (массив не пустой) —
  if (filters.category.length > 0) {
    // Оставляем только те товары, чья категория есть в списке выбранных.
    // 
    // Array.prototype.includes(value):
    // Метод массива.
    // Возвращает true, если массив содержит указанное значение (строгое равенство ===).
    result = result.filter((product) =>
      filters.category.includes(product.category),
    );
  }

  // === ФИЛЬТР ПО БРЕНДУ ===
  if (filters.brand.length > 0) {
    result = result.filter((product) => filters.brand.includes(product.brand));
  }

  // === ФИЛЬТР ПО МАКСИМАЛЬНОЙ ЦЕНЕ ===
  // Всегда применяется (даже если maxPrice = Infinity).
  // Оставляем товары, у которых цена <= выбранному максимуму.
  result = result.filter((product) => product.price <= filters.maxPrice);

  // === СОРТИРОВКА ===
  // В зависимости от значения filters.sort применяем разную сортировку.
  // Каждый раз создаём новый массив [...result] перед sort, чтобы не мутировать предыдущий result.
  // 
  // Array.prototype.sort(compareFunction):
  // Сортирует массив НА МЕСТЕ (мутирует оригинал) и возвращает его.
  // 
  // compareFunction(a, b):
  // Должна возвращать:
  //   < 0  — a должен быть перед b
  //   > 0  — a должен быть после b
  //   0    — порядок не важен
  // 
  // Если compareFunction не передана — сортирует как строки (лексикографически).
  if (filters.sort === "price-asc") {
    result = [...result].sort((a, b) => a.price - b.price);
  }
  if (filters.sort === "price-desc") {
    result = [...result].sort((a, b) => b.price - a.price);
  }
  if (filters.sort === "title-asc") {
    // String.prototype.localeCompare(other, locales):
    // Сравнивает строки с учётом локали (правильная сортировка для русского языка).
    // "А" < "Б" и т.д. Учитывает регистр и диакритику.
    result = [...result].sort((a, b) => a.title.localeCompare(b.title, "ru"));
  }

  // === КОРРЕКЦИЯ ТЕКУЩЕЙ СТРАНИЦЫ ===
  // После фильтрации общее количество страниц может уменьшиться.
  // Если пользователь был на странице 5, а теперь всего 2 страницы — currentPage станет недействительной.
  const pageCount = Math.max(1, Math.ceil(result.length / productsPerPage));
  if (currentPage > pageCount) {
    currentPage = 1; // сбрасываем на первую
  }

  // Наконец, отрисовываем результат.
  renderProducts(result);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ: updateFilterArrays()
// ═══════════════════════════════════════════════════════════════════════════════
// 
// НАЗНАЧЕНИЕ:
// Считывает текущие отмеченные чекбоксы категорий и брендов из DOM
// и записывает их значения в объект filters.category и filters.brand.
// 
// КАК ИСПОЛЬЗУЕТСЯ:
// Вызывается при:
// - изменении любого чекбокса (через listeners на filtersForm);
// - нажатии кнопки "Применить" (applyButton).
// 
// ЗАДАЧА:
// Синхронизировать состояние чекбоксов с нашим JS-объектом filters.
function updateFilterArrays() {
  // document.querySelectorAll('input[name="category"]:checked')
  //   — находит ВСЕ отмеченные чекбоксы с name="category".
  // 
  // querySelectorAll — возвращает NodeList (статическая коллекция).
  // 
  // Array.from(коллекция) — глобальный метод.
  // Превращает array-like объект (NodeList, arguments, HTMLCollection) в настоящий Array.
  // Нужен, потому что NodeList не имеет всех методов массива в старых браузерах
  // (хотя в современных уже имеет forEach и т.д., но Array.from — надёжный способ).
  // 
  // .map((el) => el.value) — для каждого найденного input берём его value.
  // value чекбокса — это то, что написано в HTML: value="gaming", value="MSI" и т.д.
  filters.category = Array.from(
    document.querySelectorAll('input[name="category"]:checked'),
  ).map((el) => el.value);

  filters.brand = Array.from(
    document.querySelectorAll('input[name="brand"]:checked'),
  ).map((el) => el.value);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ФУНКЦИЯ: initCatalog()
// ═══════════════════════════════════════════════════════════════════════════════
// 
// НАЗНАЧЕНИЕ:
// Асинхронная функция инициализации каталога.
// Загружает товары, настраивает range input цены, отрисовывает начальный список.
// 
// ВЫЗЫВАЕТСЯ:
// В самом низу файла: document.addEventListener("DOMContentLoaded", initCatalog);
// 
// ПОЧЕМУ async:
// Потому что внутри используется await loadProducts().
async function initCatalog() {
  // Загружаем все товары. Это может занять время (сетевой запрос).
  // await — ждём результат.
  allProducts = await loadProducts();

  // Если есть range input цены И есть товары —
  if (priceRange && allProducts.length) {
    // Находим максимальную цену среди всех товаров.
    // 
    // Math.max(...array) — spread syntax разворачивает массив в аргументы.
    // Math.max(100, 200, 50) === 200
    // 
    // allProducts.map((product) => product.price) — создаёт массив только цен.
    // 
    // Math.max(...[100,200,50]) → Math.max(100,200,50)
    const max = Math.max(...allProducts.map((product) => product.price));

    // Устанавливаем атрибуты range:
    // max — максимальное значение ползунка.
    // value — текущее значение (ставим на максимум, т.е. "показать все").
    // 
    // String(max) — приводим число к строке (атрибуты HTML — строки).
    priceRange.max = String(max);
    priceRange.value = String(max);

    // Синхронизируем наш объект состояния.
    filters.maxPrice = max;

    // Показываем текущую цену в output-элементе.
    priceOutput.textContent = formatPrice(max);
  }

  // Отрисовываем ВСЕ товары (без фильтров) на первой странице.
  renderProducts(allProducts);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ОБРАБОТЧИКИ СОБЫТИЙ (Event Listeners)
// ═══════════════════════════════════════════════════════════════════════════════
// 
// Все эти if (элемент) { элемент.addEventListener(...) } выполняются сразу при загрузке скрипта.
// Они "подписывают" нас на события.
// Когда пользователь взаимодействует с элементами — браузер вызывает наши колбэки.

// === ПОИСК (input событие) ===
if (searchInput) {
  // "input" событие возникает при каждом изменении значения поля (каждый нажатый символ).
  // В отличие от "change", которое возникает при потере фокуса.
  searchInput.addEventListener("input", () => {
    // Берём значение, убираем пробелы по краям (.trim() — метод String).
    filters.search = searchInput.value.trim();
    // Сбрасываем на первую страницу (иначе можем остаться на несуществующей странице).
    currentPage = 1;
    // Пересчитываем всё и перерисовываем.
    applyFilters();
  });
}

// === СОРТИРОВКА (change событие) ===
if (sortSelect) {
  // "change" — когда пользователь выбрал другой option в <select>.
  sortSelect.addEventListener("change", () => {
    filters.sort = sortSelect.value;
    currentPage = 1;
    applyFilters();
  });
}

// === ЧЕКБОКСЫ КАТЕГОРИЙ И БРЕНДОВ (change на форме) ===
if (filtersForm) {
  // Слушаем change на всей форме .filters.
  // Это "делегирование событий" (event delegation).
  // Вместо того чтобы вешать обработчик на каждый чекбокс отдельно,
  // мы слушаем на родителе. Когда событие "всплывает" (bubbling) от чекбокса — мы его ловим.
  // 
  // event.target — элемент, на котором произошло событие (конкретный input).
  filtersForm.addEventListener("change", (event) => {
    // event.target.matches(selector) — метод Element.
    // Проверяет, соответствует ли элемент CSS-селектору.
    // Здесь: только если изменился чекбокс.
    if (event.target.matches('input[type="checkbox"]')) {
      updateFilterArrays();
      currentPage = 1;
      applyFilters();
    }
  });
}

// === ПОЛЗУНОК ЦЕНЫ (input событие) ===
if (priceRange) {
  // "input" на range — срабатывает при каждом движении ползунка (плавно).
  priceRange.addEventListener("input", () => {
    filters.maxPrice = Number(priceRange.value);
    // Сразу обновляем текст с отформатированной ценой.
    priceOutput.textContent = formatPrice(filters.maxPrice);
    currentPage = 1;
    applyFilters();
  });
}

// === КНОПКА "СБРОСИТЬ" ===
if (resetButton) {
  resetButton.addEventListener("click", () => {
    // Полностью сбрасываем объект filters к начальному состоянию.
    filters.search = "";
    filters.sort = "default";
    filters.category = [];
    filters.brand = [];
    filters.maxPrice = Number(priceRange.max);

    // Синхронизируем DOM-элементы с новым состоянием.
    if (searchInput) searchInput.value = "";
    if (sortSelect) sortSelect.value = "default";

    // Снимаем все чекбоксы.
    // document.querySelectorAll(...).forEach(...) — находим все и для каждого снимаем галочку.
    document
      .querySelectorAll('.filters input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.checked = false;
      });

    if (priceRange) priceRange.value = String(filters.maxPrice);
    if (priceOutput) priceOutput.textContent = formatPrice(filters.maxPrice);

    currentPage = 1;
    applyFilters();
  });
}

// === ДЕЛЕГИРОВАННЫЙ ОБРАБОТЧИК КЛИКОВ "В КОРЗИНУ" ===
// 
// Это важный паттерн — event delegation на document.
// Мы НЕ вешаем обработчик на каждую кнопку "В корзину" отдельно (они появляются динамически через innerHTML).
// Вместо этого слушаем все клики на странице и проверяем, был ли клик на элементе с data-add-cart.
document.addEventListener("click", (event) => {
  // event.target.closest(selector) — метод Element.
  // Начинает с event.target и поднимается вверх по DOM-дереву (к родителям),
  // пока не найдёт элемент, соответствующий селектору, или не дойдёт до корня.
  // Возвращает найденный элемент или null.
  // 
  // Очень полезно при делегировании: находим ближайшую кнопку с data-add-cart.
  const addButton = event.target.closest("[data-add-cart]");

  if (addButton) {
    // Нашли кнопку. Берём id из data-атрибута.
    // button.dataset.addCart — современный доступ к data-атрибутам.
    // data-add-cart="5" → dataset.addCart === "5" (camelCase, строка!).
    // 
    // Number(...) — приводим к числу.
    const product = allProducts.find(
      (item) => Number(item.id) === Number(addButton.dataset.addCart),
    );

    if (product) {
      // Нашли товар в allProducts и вызываем общую функцию добавления.
      // addToCart из main.js сделает всё остальное (сохранение, badge, toast).
      addToCart(product);
    }
  }
});

// === ПАГИНАЦИЯ (клик на кнопки страниц) ===
if (pagination) {
  pagination.addEventListener("click", (event) => {
    // Ищем ближайшую кнопку с data-page.
    const button = event.target.closest("[data-page]");
    if (!button) return;

    // Читаем номер страницы из data-атрибута и приводим к числу.
    currentPage = Number(button.dataset.page);

    // Перерисовываем (фильтры не изменились, просто другая страница).
    applyFilters();

    // Прокручиваем страницу вверх плавно (чтобы пользователь видел начало списка).
    // window.scrollTo(options) — метод window.
    // behavior: "smooth" — нативная плавная прокрутка (без библиотек).
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// === КНОПКА "ПРИМЕНИТЬ" (для мобильного сайдбара) ===
if (applyButton) {
  applyButton.addEventListener("click", () => {
    updateFilterArrays();
    currentPage = 1;
    applyFilters();

    // После применения на мобильных — закрываем сайдбар.
    if (sidebar) {
      sidebar.classList.remove("catalog__sidebar--open");
    }
    if (filterToggle) {
      filterToggle.textContent = "Показать фильтры";
    }
  });
}

// === КНОПКА "ПОКАЗАТЬ ФИЛЬТРЫ" (туггл сайдбара на мобильных) ===
if (filterToggle && sidebar) {
  filterToggle.addEventListener("click", () => {
    // classList.toggle возвращает true/false в зависимости от того, был ли добавлен класс.
    const isOpen = sidebar.classList.toggle("catalog__sidebar--open");
    filterToggle.textContent = isOpen ? "Скрыть фильтры" : "Показать фильтры";
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ЗАПУСК ИНИЦИАЛИЗАЦИИ
// ═══════════════════════════════════════════════════════════════════════════════

// Когда DOM готов — запускаем initCatalog().
// Это загрузит данные и отрисует начальное состояние каталога.
document.addEventListener("DOMContentLoaded", initCatalog);
