const socket = io()

const clientsTotal = document.getElementById('client-total')
const messageContainer = document.getElementById('message-container')
const nameInput = document.getElementById('name-input')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')
const pollContainer = document.getElementById('poll-options')
const pollForm = document.getElementById('poll-form')
const pollOptionInput = document.getElementById('poll-option-input')

messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  sendMessage()
})

pollForm.addEventListener('submit', (e) => {
  e.preventDefault()
  addPollOption()
})

socket.on('clients-total', (data) => {
  clientsTotal.innerText = `Number Of Users: ${data}`
})

socket.on('poll-options', (data) => {
  updatePollOptions(data)
})

socket.on('poll-update', (data) => {
  updatePollOptions(data)
})

socket.on('feedback', (data) => {
  clearFeedback()
  if (data.feedback) {
    const element = `
        <li class="message-feedback">
          <p class="feedback">${data.feedback}</p>
        </li>
    `
    messageContainer.innerHTML += element
    scrollToBottom()
  }
})

messageInput.addEventListener('focus', () => {
  socket.emit('feedback', {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  })
})

messageInput.addEventListener('keypress', () => {
  socket.emit('feedback', {
    feedback: `${nameInput.value} is typing a message`,
  })
})

messageInput.addEventListener('blur', () => {
  socket.emit('feedback', {
    feedback: '',
  })
})

function sendMessage() {
  if (messageInput.value === '') return
  const data = {
    name: nameInput.value || 'Anonymous',
    message: messageInput.value,
    dateTime: new Date(),
  }
  socket.emit('message', data)
  addMessageToUI(true, data)
  messageInput.value = ''
}

function addPollOption() {
  const option = pollOptionInput.value
  if (option === '') return
  socket.emit('new-option', option)
  pollOptionInput.value = ''
}

function vote(option) {
  socket.emit('vote', option)
}

function addMessageToUI(isOwnMessage, data) {
  clearFeedback()
  const element = `
      <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
          <p class="message">
            ${data.message}
            <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
          </p>
        </li>
        `
  messageContainer.innerHTML += element
  scrollToBottom()
}

function updatePollOptions(options) {
  pollContainer.innerHTML = ''
  for (const [option, votes] of Object.entries(options)) {
    const element = `
        <li>
          ${option} - ${votes} votes
          <button onclick="vote('${option}')">Vote</button>
        </li>
    `
    pollContainer.innerHTML += element
  }
}

function clearFeedback() {
  document.querySelectorAll('li.message-feedback').forEach((element) => {
    element.parentNode.removeChild(element)
  })
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight)
}