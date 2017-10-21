import { midiKeys } from './midi-keys'

if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode.')
}

midiKeys.connect().then(() =>
  console.log(midiKeys)
)
