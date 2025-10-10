import { atom } from 'jotai'

// 对比列表状态
export const compareListAtom = atom<number[]>([])

// 对比模态框状态
export const compareModalOpenAtom = atom<boolean>(false)