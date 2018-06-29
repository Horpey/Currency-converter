const el = e => document.querySelector(e);
const insertHTML = (e) => {

}
const getFromCurrencyName = () => {
    return el("#fromCurrency").value;
};
const getToCurrencyName = () => {
    return el("#toCurrency").value;
};
const getFromCurrencyId = () => {
    return el("#fromCurrency").value;
};
const getToCurrencyId = () => {
    return el("#toCurrency").value;
};
const getFromCurrencyValue = () => {
    return el("#fromCurrencyValue").value;
};


idSymbolFrom = 'Lek';
idSymbolTo = 'Lek';



convert = (s) => {

    let fromValue = document.querySelector('#fromCurrencyValue').value;
    let fromCurr = document.querySelector('#fromCurrency').value;
    let toCurr = document.querySelector('#toCurrency').value;

    const query = `${fromCurr}_${toCurr}`;
    const requestUrl = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`;

    fetch(requestUrl)
        .then(response => response.json())
        .then(responseValue => {

            let unitValue = responseValue[`${fromCurr}_${toCurr}`];

            let currencyConverted = fromValue * unitValue;


            console.log(requestUrl);

            document.getElementById("viewValue").innerHTML = `${idSymbolTo} ${Math.round(currencyConverted)}.00`;

            document.getElementById("conversionUnit").innerHTML = `${idSymbolFrom} 1 = ${idSymbolTo}  ${Math.round(unitValue)} `;
        });

}




// Service Worker registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('./service-worker.js', {
            scope: './'
        })
        .then(registration => {
            console.log("Service Worker Registered", registration);
        })
        .catch(err => {
            console.log("Service Worker failed to Register", err);
        })
}

// // Function for API Call

fetch('https://free.currencyconverterapi.com/api/v5/countries')
    .then(response => response.json())
    .then(myJson => {

        let html = '';
        for (let country of Object.values(myJson.results)) {
            // console.log(country);
            html += `<option id="${country.currencySymbol}" value="${country.currencyId}">${country.currencyName}</option>`;
        }
        el("#fromCurrency").insertAdjacentHTML('afterbegin', html);
        el("#toCurrency").insertAdjacentHTML('afterbegin', html);
    });




showFromId = (s) => {
    idSymbolFrom = s[s.selectedIndex].id;
    userConnection()
    convert()
}


showFromIdTwo = (s) => {
    idSymbolTo = s[s.selectedIndex].id;
    userConnection()
    convert()
}

// Toastr Diplay
userConnection = () => {
    if (navigator.onLine) {

    } else {
        // Display an info toast with no title
        toastr.warning(`Sorry Conversion can't be made offline`);
        toastr.options = {
            "positionClass": "toast-bottom-center"
        }
    }
}


// IndexedDb initialization

const dbPromise = idb.open('currencyConverter', 3, (upgradeDb) => {
    switch (upgradeDb.oldVersion) {
        case 0:
            upgradeDb.createObjectStore('countries', {
                keyPath: 'currencyId'
            });
        case 1:
            let countriesStore = upgradeDb.transaction.objectStore('countries');
            countriesStore.createIndex('country', 'currencyName');
            countriesStore.createIndex('country-code', 'currencyId');
        case 2:
            upgradeDb.createObjectStore('conversionRates', {
                keyPath: 'query'
            });
            let ratesStore = upgradeDb.transaction.objectStore('conversionRates');
            ratesStore.createIndex('rates', 'query');
    }
});


document.addEventListener('DOMContentLoaded', () => {
    /*
     Fetch Countries 
      */
    fetch('https://free.currencyconverterapi.com/api/v5/countries')
        .then(res => res.json())
        .then(res => {
            Object.values(res.results).forEach(country => {
                dbPromise.then(db => {
                    const countries = db.transaction('countries', 'readwrite').objectStore('countries');
                    countries.put(country);
                })
            });
            dbPromise.then(db => {
                const countries = db.transaction('countries', 'readwrite').objectStore('countries');
                const countriesIndex = countries.index('country');
                countriesIndex.getAll().then(currencies => {
                    // fetchCountries(currencies);
                })
            })
        }).catch(() => {
            dbPromise.then(db => {
                const countries = db.transaction('countries').objectStore('countries');
                const countriesIndex = countries.index('country');
                countriesIndex.getAll().then(currencies => {
                    // fetchCountries(currencies);
                })

            });
        });
});