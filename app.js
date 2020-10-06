// Selectors

const formSearch = document.querySelector('.form-search')
const inputCitiesFrom = formSearch.querySelector('.input__cities-from')
const dropDownCitiesFrom = formSearch.querySelector('.dropdown__cities-from')
const inputCitiesTo = formSearch.querySelector('.input__cities-to')
const dropDownCitiesTo = formSearch.querySelector('.dropdown__cities-to')
const inputDateDepart = formSearch.querySelector('.input__date-depart')

const cheapestTicket = document.getElementById('cheapest-ticket')
const otherCheapTickets = document.getElementById('other-cheap-tickets')

// Data

const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json'

const proxy = ' https://cors-anywhere.herokuapp.com/'

/* const API_KEY = 'a11404b72cb71297f5440262b90dcf8a' */

const calendar = 'http://min-prices.aviasales.ru/calendar_preload'

const MAX_COUNT = 10

let cities = []

// Functions

const getData = (url, callback) => {
    const request = new XMLHttpRequest()

    request.open('GET', url)

    request.addEventListener('readystatechange', () => {
        if (request.readyState !== 4) return

        if (request.status === 200) {
            callback(request.response)
        } else {
            console.error(request.status)
        }
    })

    request.send()
}

function showCities(input, list) {
    list.textContent = ''

    if (input.value !== '') {

        const filteredCity = cities.filter(item => item.name.toLowerCase().startsWith(input.value.toLowerCase()))

        filteredCity.forEach(item => {
            const cityLi = document.createElement('li')
            cityLi.classList.add('dropdown__city')
            cityLi.textContent = item.name
            list.append(cityLi)

            cityLi.addEventListener('click', event => {
                input.value = event.target.textContent
                list.textContent = ''

            })
        })
    }
}

const getNameCity = code => {
    const objCity = cities.find(item => item.code === code)

    return objCity.name
}

const getDate = date => {
    return new Date(date).toLocaleString('ru', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getChanges = num => {
    if (num) {
        return num === 1 ? 'С одной пересадкой' : 'С двумя пересадками'
    } else return 'Без пересадок'
}

const getLinkTicket = data => {
    let link = 'https://www.aviasales.ru/search/'
    link += data.origin + new Date(data.depart_date)

    const day = new Date(data.depart_date).getDate()
    const month = new Date(data.depart_date).getMonth() + 1

    link += day < 10 ? '0' + day : day 
    link += month < 10 ? '0' + month : month
    link += data.destination

    return link + 1
}

const createCard = (data) => {
    const ticket = document.createElement('article')
    ticket.classList.add('ticket')
    let deep = ''

    if (data) { 
        deep = `
        <h3 class="agent">${data.gate}</h3>
        <div class="ticket__wrapper">
            <div class="left-side">
                <a href="${getLinkTicket(data)}" target="_blank" class="button button__buy">Купить
                    за ${data.value}₽</a>
            </div>
            <div class="right-side">
                <div class="block-left">
                    <div class="city__from">Вылет из города
                        <span class="city__name">${getNameCity(data.origin)}</span>
                    </div>
                    <div class="date">${getDate(data.depart_date)}</div>
                </div>

                <div class="block-right">
                    <div class="changes">${getChanges(data.number_of_changes)}</div>
                    <div class="city__to">Город назначения:
                        <span class="city__name">${getNameCity(data.destination)}</span>
                    </div>
                </div>
            </div>
        </div>
    `
    } else deep = '<h3>К сожалению на текущую дату билетов не нашлось</h3>'

    ticket.insertAdjacentHTML('afterbegin', deep)

    return ticket 
}

const renderCheapDay = (cheapTicket) => {
    cheapestTicket.style.display = 'block'
    cheapestTicket.innerHTML =  '<h1>Самый дешевый билет на выбранную дату</h1>'

    const ticket = createCard(cheapTicket[0])
    cheapestTicket.append(ticket)
}

const renderCheapYear = (arr) => {
    otherCheapTickets.style.display = 'block'
    otherCheapTickets.innerHTML = '<h1>Самые дешевые билеты на другие даты</h1>'

    arr.sort((a,b) => {
        if (a.value > b.value) return 1
        if (a.value < b.value) return -1
        return 0

    })

    for (let i = 0; i < arr.length && i < MAX_COUNT; i ++ ) {
        const ticket = createCard(arr[0])
        otherCheapTickets.append(ticket)
    }
}

function renderDate(data, date) {
    const cheapTicketsYear = JSON.parse(data).best_prices

    const cheapTicketDay = cheapTicketsYear.filter((item) => {
        return item.depart_date === date
    })

    renderCheapYear(cheapTicketsYear)
    renderCheapDay(cheapTicketDay)
}


// Listeners

inputCitiesFrom.addEventListener('input', () => showCities(inputCitiesFrom, dropDownCitiesFrom))

inputCitiesTo.addEventListener('input', () => showCities(inputCitiesTo, dropDownCitiesTo))

formSearch.addEventListener('submit', event => {
    event.preventDefault()

    const formData = {
        from: cities.find(item => item.name === inputCitiesFrom.value),
        to: cities.find(item => item.name === inputCitiesTo.value),
        when: inputDateDepart.value
    }

    if (formData.from && formData.to) {

    const requestData = `?depart_date=${formData.when}&origin=${formData.from.code}&destination=${formData.to.code}&one_way=true`

    getData(proxy + calendar + requestData, (response) => {
        renderDate(response, formData.when)
    })
    } else {
        alert('Такого города не существует')
    }
})

// Calls

getData(proxy + citiesApi, (data) => {
    const dataCities = JSON.parse(data)

    dataCities.sort((a, b) => { 
        if (a.name > b.name) {
          return 1
        } 
        if (a.name < b.name) { 
          return -1
        } 
        return 0; 
      })

    cities = dataCities.filter(item => item.name)

    console.log(cities);
})