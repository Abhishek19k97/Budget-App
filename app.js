// BUDGET CONTROLLER

const budgetController = (function () {
    // function Constructor
    const Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercetage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.floor((this.value/totalIncome)*100);    
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    // function constructor
    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    const calculateTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        })
        data.totals[type] = sum;
    }
   
    const data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    // public access
    return {
        addItem: function (type, desc, value) {
            let newItem, ID;

            // ID = last ID + 1
            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;               
            } else {
                ID = 0;
            }

            // create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                // 'instance/new object' created from Expense function constructor
                newItem = new Expense(ID,desc,value);
            } else if (type === 'inc') {
                // 'instance/new object' created from Income function constructor
                newItem = new Income(ID,desc,value);
            }

            // push it into our data structure
            data.allItems[type].push(newItem);
            return newItem;
        },

        calculateBudget: function () {
            // calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // calculate total budget
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage
            if (data.totals.inc>0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentage: function () {
            data.allItems.exp.forEach(function (current) {
                current.calcPercetage(data.totals.inc);
            });
        },

        getPercentage: function () {
            let allPercentages;
            allPercentages = data.allItems.exp.map(function (current) {
                return  current.getPercentage();
            })
            return allPercentages;
        },

        deleteItem: function (type, id) {
            let idsArr, index;

            // getting an array of all the data id created by us
            idsArr = data.allItems[type].map(function(current) {
                return current.id;
            });

            // getting the index number of the item that will be deleted
            index = idsArr.indexOf(id);

            // deleting the concerned item
            if ( index!== -1) {
                data.allItems[type].splice(index, 1)
            }
        },

        getBudget: function () {
            return {
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                budget: data.budget,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    }

})();

//   ----------------------------------------------------------------------------------------------------------------------------------------------

// UI CONTROLLER
const UIController = (function () {

    const DOMStrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        expenseContainer: ".expenses__list",
        incomeContainer: ".income__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensePercentageLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    }
    
    // public access
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            let html, newHtml, element;
            // Create HTML string with placeholder text
            if(type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = `<div class="item clearfix" id="exp-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                                <div class="item__percentage">21%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;                     
            }

            // Replace the placeholder text with actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',obj.value); 

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },

        deleteListItem: function(itemID) {
            let element;
            element = document.getElementById(itemID);
            element.parentNode.removeChild(element);
        },

        diaplayExpensePercentage: function (percentageArray) {
            let fields;
            fields = document.querySelectorAll(DOMStrings.expensePercentageLabel)

            // Creating our own forEach function for Nodelist
            const nodeListForEach = function (nodeList, callback) {
                let index;
                for (let i = 0; i < nodeList.length; i++) {
                    callback(nodeList[i],i);
                }
            }
            nodeListForEach(fields,function(current, index) {
                if (percentageArray[index] > 0) {
                    current.textContent = percentageArray[index] + '%';                    
                } else {
                    current.textContent = '---'
                }
            })

        },

        clearFields: function () {
            let fields, fieldsArr;

            fields = document.querySelectorAll(`${DOMStrings.inputDesc}, ${DOMStrings.inputValue}`);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (currElement, index, array) {
                currElement.value = '';
            });
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expenseLabel).textContent = obj.totalExp;

            if (obj.percentage>0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = `${obj.percentage}%`;               
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayMonth: function () {
            // getting date using date object constructor
            let now, year , month, months
            months = ['Jan','Feb','Mar','Apr','May','June','July','Aug','Sep','Oct','Nov','Dec'];
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = `${months[month]} ${year}`
        },
        
        getDOMStrings: function () {
            return DOMStrings;
        },
    };

})();

//   ----------------------------------------------------------------------------------------------------------------------------------------------

// GLOBAL APP CONTROLLER
const controller = (function (budgetCtrl, UICtrl) {

    const setUpEventListner = function() {
        let DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress', function (event) {
        if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
        }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    const updateBudget = function(){
        // 6. Calculate the budget
        budgetCtrl.calculateBudget();

        // 7. Return the budget
        let budget = budgetCtrl.getBudget();

        // 8. Display the budget on the UI  
        UICtrl.displayBudget(budget);   
    };

    const updatePercentage = function () {
        // 1.Calculate the percentage
        budgetCtrl.calculatePercentage();

        // 2. Read Percentage from the budget controller
        let percentages;
        percentages = budgetCtrl.getPercentage();

        // 3. Update the UI with new percentage
        UICtrl.diaplayExpensePercentage(percentages);
    }
    
    const ctrlAddItem = function () {    
        let input, newItem;   
        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && input.value > 0 && !isNaN(input.value)) {
        // 2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // 3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        // 4. Clear the fields after showing the input
        UICtrl.clearFields();

        // 5. Calculate and update the Budget
        updateBudget(); 
        
        // 6. Calculate and update percentages
        updatePercentage();
        } 
    };

    const ctrlDeleteItem = function(event) {
        let eventID, splitID, type, ID;

        eventID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (eventID) {
            splitID = eventID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
        }

        // 1. delete item for data structure
        budgetCtrl.deleteItem(type, ID);

        // 2. delete the item from the UI
        UICtrl.deleteListItem(eventID);

        // 3. Update the budget and UI after deletion
        updateBudget(); 

        // 4. Calculate and Update the percentages
        updatePercentage();
    };

    // public access
    return {
        init: function() {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                totalInc: 0,
                totalExp: 0,
                budget: 0,
                percentage: -1
            })
            setUpEventListner();
        }
    }

})(budgetController, UIController);

controller.init();