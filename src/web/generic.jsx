import { update } from './common'

const MARK_LOADING = 'mark loading '
const SET_RESULT = 'set result '
const ERRORED = 'errored  '

export function updateLeave(root, pathElements, updateValue) {
  if (!pathElements.length) {
    return update(root, updateValue)
  }
  return update(root, {
    [pathElements[0]]: updateLeave(
      root[pathElements[0]] || {},
      pathElements.slice(1),
      updateValue
    )
  })
}

const IGNORE_INITIAL_SPACE_FOR_ALL_ACTION_TYPES = 6
function findPath(str) {
  return str.slice(str.indexOf(' ', IGNORE_INITIAL_SPACE_FOR_ALL_ACTION_TYPES))
}

const types = [MARK_LOADING, SET_RESULT, ERRORED]

function getActionType(str) {
  for (let type of types) {
    if (str.indexOf(type) === 0) {
      return type
    }
  }
}

export default function(store, action) {
  let newValue
  const match = getActionType(action.type)
  switch(match) {
    case MARK_LOADING:
      newValue = { loading: true }
      break
    case SET_RESULT:
      newValue = { loading: false, result: action.result }
      break
    case ERRORED:
      newValue = { loading: false, error: action.error }
      break
    default:
      return store
  }
  const leavePath = action.type.substr(findPath(action.type)).split('/')
  return updateLeave(store, leavePath, newValue)
}