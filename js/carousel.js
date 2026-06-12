async function startPartnersCarousel() {
  // 1. Находим элемент-контейнер для карусели
  const track = document.querySelector(".partners__track");

  // Если элемента нет на странице — просто прекращаем работу скрипта
  if (!track) return;

  // Проверяем, не отключил ли пользователь анимации в настройках своей ОС
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  try {
    // 2. Загружаем список партнеров из файла
    const response = await fetch("./data/partners.json");
    const partners = await response.json();

    // 3. Проходимся по каждому партнеру и создаем для него HTML-элементы
    for (const partner of partners) {
      if (!partner.src) continue; // Пропускаем, если нет картинки

      const item = document.createElement("div");
      item.className = "partners__item";

      const img = document.createElement("img");
      img.src = partner.src;
      img.alt = partner.alt || "Партнер";

      item.appendChild(img);
      track.appendChild(item);
    }

    // 4. Хитрость для бесконечной прокрутки:
    // Просто копируем всё содержимое и вставляем его же в конец.
    // Теперь у нас два одинаковых списка подряд.
    track.innerHTML += track.innerHTML;

    // 5. Настройка анимации
    let position = 0; // Текущая позиция прокрутки
    let isPaused = false; // Флаг паузы
    const speed = 0.5; // Скорость (пиксели за кадр)

    function animate() {
      if (!isPaused) {
        position += speed;

        // Если мы прокрутили ровно половину всей длины (то есть первый оригинальный список)
        // Мы незаметно сбрасываем позицию в 0 (в начало).
        // Глаз этого не заметит, так как списки идентичны.
        if (position >= track.scrollWidth / 2) {
          position = 0;
        }

        // Сдвигаем контейнер влево
        track.style.transform = `translateX(-${position}px)`;
      }

      // Просим браузер вызвать эту же функцию перед отрисовкой следующего кадра
      requestAnimationFrame(animate);
    }

    // 6. Ставим на паузу, когда пользователь наводит мышку или касается экрана
    track.addEventListener("mouseenter", () => (isPaused = true));
    track.addEventListener("mouseleave", () => (isPaused = false));
    track.addEventListener("touchstart", () => (isPaused = true));
    track.addEventListener("touchend", () => (isPaused = false));

    // 7. Запускаем анимацию
    animate();
  } catch (error) {
    // Если произошла ошибка (например, нет интернета или файла)
    console.error("Не удалось загрузить карусель:", error);
    track.innerHTML = '<div style="color: gray;">Не удалось загрузить список партнёров</div>';
  }
}

// Запускаем скрипт только когда вся страница (HTML) полностью загрузилась
document.addEventListener("DOMContentLoaded", startPartnersCarousel);
