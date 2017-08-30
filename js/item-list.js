ItemList = function (_modeCompact, _projectId, _sprintId, _readOnly) {
    /***********Свойства отображения*********/
    // Спринт
    this.sprintId = _sprintId;
    // Проект
    this.projectId = _projectId;
    // Настройка режима отображения элементов: компактно или нет
    this.modeCompact = _modeCompact;
    // Толкьо чтение
    this.readOnly = _readOnly;

    // Фильтр
    this.filter = {
        _type: '',
        _employeeList: [],
        _priorityList: [],
        _dateFrom: '',
        _dateTo: '',
        _sprintId: null,
        _projectId: null
    };

    // Сортировка
    this.sort = {
        // Значения по умолчанию
        field: 'number',
        dest: 'acs'
    }
    /*****************************************/

    /***********Свойства списка***************/
    // Работники
    this.employeeList = new EmployeeList();

    // Возможные статусы, как JSON
    this.states = states_test;

    // Получить данные по спринту/проекту
    this.getData = function () {
        var params = {
            sprintId: this.sprintId,
            projectId: this.projectId
        }

        var result = connector.executeScript("AK_SBGetItemsData", params)
        if (!result) {
            result = items_test
        }
        return result;
    };
    // Все элементы, как JSON - т.е. все выгруженные значения без фильтров и сортировок
    this.itemsData = this.getData();

    // Список созданных объектов с учетом фильтров и сортировок
    this.items = [];
    /*****************************************/

    /***********Основные методы работы со списком***************/
    // Получить элемент из массива по его ИД
    this.getItemById = function (id) {
        var items = this.items;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var itemID = item.id;

            if (id === itemID) {
                return item;
            }
        }
    };

    // Получить элемент из массива JSON по его ИД
    this.getItemDataById = function (id) {
        var itemsData = this.itemsData;
        for (var j = 0; j < itemsData.length; j++) {
            var data = itemsData[j];
            if (data.id === id) {
                return data
            }
        }
    };

    // Очистить текущий список объектов
    this.deleteItems = function () {
        //var items = this.items;
        // Удалить 
        //for (var i = 0; i < items.length; i++) {
        //    var item = items[i];
        //    item.delete()
        //}
        this.items = [];
    }

    // Создать новый список на основе JSON
    this.createItems = function () {
        var items = this.items;
        var itemsData = this.itemsData;

        for (var i = 0; i < itemsData.length; i++) {
            // Элемент из JSON
            var itemData = itemsData[i];
            // создать новый элемент и добавить в список, если его еще не было
            item = new Item(itemData);
            items.push(item);
        }
    }

    // Применить фильтр к значениям
    this.applyFilter = function () {
        var filter = this.filter;

        console.log("Начальное значение:");
        console.log(this.items);

        // Создать заново элементы из JSON
        this.deleteItems();
        this.createItems();

        // Результатом будут только подходящие под фильтр элементы
        var newItems = this.items.filter(
            function (element, index, array) {
                var checked = element.checkByFilter(filter);
                return checked;
            }
        )

        console.log("Отфильтрованное значение:");
        console.log(newItems);
        this.items = newItems;
    }

    // Применить сортировку
    this.applySort = function () {
        var items = this.items;
        var sortField = this.sort.field;
        var sortDest = this.sort.dest;
        
        // Коэффициент направления сортировки
        // Если сортировка по убыванию, то всё наоборот - результат умножается на -1
        var koefDest = sortDest === 'desc' ? -1 : 1;
        // Дополнительный коэффициент для сортировки, когда большее значение соответсвует меньшему: приоритет 0 выше приоритета 1
        // Для поля Приоритет - чем выше значение, тем ниже приоритет
        var koef = sortField === 'priorityId' ? -1 : 1;

        console.log("Начальное значение:");
        console.log(this.items);

        // Результатом будут отсортированные элементы
        var newItems = this.items.sort(
            function (item1, item2) {
                // Результат сравнения:
                var result = 0;

                // В field хранится поле, по которому идет сравнение
                var value1 = item1[sortField];
                var value2 = item2[sortField];

                // Сравнение
                // Если текущие значения не отличаются - не сортировать
                if (value1 != value2) {
                    // Результат сравнения:
                    //Если compareFunction(a, b) меньше 0, сортировка поставит a по меньшему индексу, чем b, то есть, a идёт первым.
                    //Если compareFunction(a, b) вернёт 0, сортировка оставит a и b неизменными по отношению друг к другу, но отсортирует их по отношению ко всем другим элементам.Обратите внимание: стандарт ECMAscript не гарантирует данное поведение, и ему следуют не все браузеры (например, версии Mozilla по крайней мере, до 2003 года).
                    //Если compareFunction(a, b) больше 0, сортировка поставит b по меньшему индексу, чем a.
                    result = value1 < value2 ? -1 : 1;
                    result = result * koef * koefDest;
                }

                return result;
            }
        );

        console.log("Отсортированное значение:");
        console.log(newItems);
        this.items = newItems;
    }

    // Получить объекты из JSON с учетом фильтров и сортировок
    this.setItems = function () {
        // Очистить текущий список
        this.deleteItems();

        // Создать новый список
        this.createItems();

        // Применить фильтр
        this.applyFilter();

        // Применить сортировку
        this.applySort();
    }

    // Отрисовать статусы
    this.renderStates = function () {
        var container = document.getElementById("states");
        var containerCols = document.getElementById("item-row");

        var states = this.states;
        states.forEach(function (data) {
            // создать новый статус
            var state = new State(data);
            // отрисовать статус
            state.render(container);
            state.renderColumn(containerCols);
        });
    }

    // Очистить область от элементов
    this.clear = function () {
        var elements = document.querySelectorAll('.item');
        for (var i = 0; i < elements.length; i++) {
            element = elements[i];
            console.log(element);

            element.parentNode.removeChild(element);
        }
    }

    // Отрисовать все элементы
    this.renderItems = function () {
        this.clear();

        var items = this.items;

        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            item.render(this.modeCompact)
        }
    }

    // Обновить элементы - получить с сервера
    this.update = function () {
        // Получить данные с сервера

        // Преобразовать их в JSON
        this.itemsData = items_test_new;

        // Обновить элементы в DOM
        this.refresh();
    }

    // Обновить элементы
    this.refresh = function () {       
        // Создать элементы
        this.setItems();

        // Отрисовать элементы
        this.renderItems();
    }

    // Добавить новый элемент
    this.addNew = function (stateId) {
        var item = new Item(stateId);
        var data = item.add();
        // Добавить результат в JSON список
        this.itemsData.push(data);
        this.refresh();
    }

    // Удалить элемент
    this.deleteItem = function () {
        console.log(this)
    }

    // Сменить режим отображения Полный/Компактный
    this.setViewMode = function (viewMode_) {
        this.modeCompact = viewMode_;

        var elements = document.querySelectorAll('.item');
        var element, arr, item;
        for (var i = 0; i < elements.length; i++) {
            element = elements[i];
            arr = element.id.split("-");
            item = this.getItemById(arr[arr.length - 1]);
            if (item !== undefined) {
                item.setViewMode(this.modeCompact);
            }
        }
    }

    // Установить текущее значение фильтра и применить его
    this.setFilter = function (selector) {
        var COMPARE = {
            ".select-employee": '_employeeList',
            ".select-priority": '_priorityList',
            ".select-issue-type": '_type',
            "#plan-date-from": '_dateFrom',
            "#plan-date-to": '_dateTo',
            ".select-sprint": '_sprintId'
        };
        var element = $(selector);
        var classList = element[0].classList;
        var filterValue = element.val();
        // Если это дата - распарсить к дате
        if (classList.contains("datepicker")) {
            filterValue = $.datepicker.parseDate("dd.mm.yy", filterValue)
        } else {
            if (filterValue === undefined) {
                filterValue = element.value
            }
        }

        var filterName = COMPARE[selector];
        this.filter[filterName] = filterValue;

        this.refresh();
    }

    // Установить текущее значение сортировки и применить её
    this.setSort = function (par) {
        var newField = par.value;
        var newDest = 'asc';

        var curSort = this.sort;
        if (curSort['field'] === newField) {
            if (curSort['asc'] === 'asc') {
                newDest = 'desc'
            }
        }

        this.sort['field'] = newField;
        this.sort['dest'] = newDest;

        this.refresh();
    }

    this.itemsData();
}

Employee = function (_id, _name) {
    this.id = _id;
    this.name = _name;

    this.render = function () {
        var container = document.querySelector(".select-employee");
        var optionList = container.options;
        
        // Найти работника в списке
        var founded = false;
        for (var i = 0; i < optionList.length; i++) {
            var option = optionList[i];
            founded = option.value === this.id;
            if (founded) { break; }
        }
        if (!founded) {
            // Создать работника в списке
            var element = document.createElement("option");
            element.classList.add('select-employee-option');
            element.value = this.id;
            element.innerHTML = this.name;
            container.appendChild(element);
        }
    }
}

EmployeeList = function (data) {
    this.data = [];
    this.employees = [];

    this.add = function (employee) {
        this.employees.push(employee);
        this.data.push({ id: employee.id, text: employee.name });
        employee.render();
    }

    this.getEmployeeById = function (_id) {
        var data = this.data;
        for (var i = 0; i < data.length; i++) {
            employee = data[i];
            if (employee.id === _id) {
                return employee
            }
        }
    }
}
