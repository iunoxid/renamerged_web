class DOMUtils {
    static getElementById(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id '${id}' not found`);
        }
        return element;
    }

    static createElement(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);

        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });

        if (textContent) {
            element.textContent = textContent;
        }

        return element;
    }

    static clearElement(element) {
        if (element) {
            element.innerHTML = '';
        }
    }

    static addClass(element, className) {
        if (element && className) {
            element.classList.add(className);
        }
    }

    static removeClass(element, className) {
        if (element && className) {
            element.classList.remove(className);
        }
    }

    static toggleClass(element, className) {
        if (element && className) {
            element.classList.toggle(className);
        }
    }

    static show(element) {
        if (element) {
            element.style.display = 'block';
        }
    }

    static hide(element) {
        if (element) {
            element.style.display = 'none';
        }
    }
}

window.DOMUtils = DOMUtils;