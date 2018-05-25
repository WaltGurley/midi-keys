function midiMessageSetup () {
  if (!midiKeys.connected) return

  // variables only for oscillator if enabled
  const context = new AudioContext()
  const oscillators = {}
  const gain = {}

  const masterGain = context.createGain()
  masterGain.gain.value = 0.1

  const analyser = context.createAnalyser()
  masterGain.connect(analyser)
  analyser.fftSize = 2048
  var bufferLength = analyser.frequencyBinCount
  var waveform = new Uint8Array(bufferLength)
  var spectrum = new Uint8Array(bufferLength)

  midiKeys.audioContext = context
  midiKeys.analyser = {
    'analyser': analyser,
    'getWaveform': function () {
      analyser.getByteTimeDomainData(waveform)
      return waveform
    },
    'getSpectrum': function () {
      analyser.getByteFrequencyData(spectrum)
      return spectrum
    }
  }

  function convertMidiToFrequency (midiNote) {
    return Math.pow(2, ((midiNote - 69) / 12)) * 440
  }

  function playNote (frequency) {
    oscillators[frequency] = context.createOscillator()
    gain[frequency] = context.createGain()
    gain[frequency].gain.value = 1
    oscillators[frequency].frequency.value = frequency
    oscillators[frequency].connect(gain[frequency])
    gain[frequency].connect(masterGain)
    masterGain.connect(context.destination)
    oscillators[frequency].start(context.currentTime)
  }

  function stopNote (frequency) {
    gain[frequency].gain.linearRampToValueAtTime(0, context.currentTime + 0.1)
    oscillators[frequency].stop(context.currentTime + 0.1)
  }

  const handleMidiMessage = function messageHandler (message) {
    const frequency = convertMidiToFrequency(message.data[1])

    if (midiKeys.oscillatorOn) {
      if (message.data[0] === 144 && message.data[2] > 0) {
        playNote(frequency)
      }

      if (message.data[0] === 128 || message.data[2] === 0) {
        stopNote(frequency)
      }
    }

    midiKeys.midiMsg = message.data
    midiKeys.frequency = frequency
    // console.log(midiKeys.audioContext)
  }

  midiKeys.inputs.forEach(function (device) {
    device.onmidimessage = handleMidiMessage
  })
}

function setupMidiDevices (access) {
  // Get lists of available MIDI controllers
  let midiInputDevices = findMidiDevice(access.inputs)
  let midiOutputDevices = findMidiDevice(access.outputs)
  // let allMidiDevices = [...midiInputDevices, ...midiOutputDevices]
  midiKeys.inputs = midiInputDevices
  midiKeys.outputs = midiOutputDevices
  midiKeys.connected = midiInputDevices.length > 0

  function findMidiDevice (midiList) {
    let devices = []
    midiList.forEach(port => {
      devices.push(port)
    })
    return devices
  }

  const handleMidiConnectionChange = function (event) {
    if (event.port.state === 'disconnected') {
      if (event.port.type === 'input') {
        midiInputDevices.splice(midiInputDevices.indexOf(this), 1)
        console.log('Disconnected the following MIDI input:', this)
      } else if (event.port.type === 'output') {
        midiOutputDevices.splice(midiOutputDevices.indexOf(this), 1)
        console.log('Disconnected the following MIDI output:', this)
      }
    } else if (event.port.state === 'connected') {
      midiInputDevices = findMidiDevice(access.inputs)
      midiOutputDevices = findMidiDevice(access.outputs)
      console.log('Connected the following MIDI devices:\n',
        'MIDI inputs:', ...midiInputDevices,
        'MIDI outputs:', ...midiOutputDevices
      )
    }
  }

  access.onstatechange = handleMidiConnectionChange
  midiMessageSetup()
}

function connect () {
  if (navigator.requestMIDIAccess) {
    return navigator.requestMIDIAccess()
      .then(
        setupMidiDevices,
        (error) => console.log('MIDI access failed. Error code: ' + error.code)
      )
  } else {
    console.log('This browser does not support Web MIDI API. See browser support table: http://caniuse.com/#search=web%20midi')
  }
}

const midiKeys = {
  connect,
  connected: false,
  inputs: null,
  outputs: null,
  midiMsg: null,
  frequency: null,
  audioContext: null,
  analyser: null,
  oscillatorOn: false
}

export { midiKeys }
