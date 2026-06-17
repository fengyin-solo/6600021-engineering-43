import { describe, it, expect } from 'vitest'
import { BRAILLE_MAP, textToBraille, brailleToText, dotsToUnicode, DOT_POSITIONS } from '../utils/braille'

describe('BRAILLE_MAP', () => {
  it('包含26个英文字母', () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (const letter of letters) {
      expect(BRAILLE_MAP[letter]).toBeDefined()
      expect(Array.isArray(BRAILLE_MAP[letter])).toBe(true)
    }
  })

  it('包含数字0-9的映射', () => {
    const digits = '012345'
    for (const d of digits) {
      expect(BRAILLE_MAP[d]).toBeDefined()
    }
  })

  it('空格映射为空数组', () => {
    expect(BRAILLE_MAP[' ']).toEqual([])
  })

  it('每个点位在1-6范围内', () => {
    for (const dots of Object.values(BRAILLE_MAP)) {
      for (const d of dots) {
        expect(d).toBeGreaterThanOrEqual(1)
        expect(d).toBeLessThanOrEqual(6)
      }
    }
  })
})

describe('DOT_POSITIONS', () => {
  it('定义了6个点位的坐标', () => {
    expect(Object.keys(DOT_POSITIONS).length).toBe(6)
    for (let i = 1; i <= 6; i++) {
      expect(DOT_POSITIONS[i]).toBeDefined()
      expect(DOT_POSITIONS[i].length).toBe(2)
    }
  })
})

describe('textToBraille', () => {
  it('空字符串返回空数组', () => {
    expect(textToBraille('')).toEqual([])
  })

  it('单个字母转换正确', () => {
    expect(textToBraille('A')).toEqual([[1]])
    expect(textToBraille('B')).toEqual([[1, 2]])
    expect(textToBraille('Z')).toEqual([[1, 3, 5, 6]])
  })

  it('小写字母自动转换为大写', () => {
    expect(textToBraille('a')).toEqual([[1]])
    expect(textToBraille('hello')).toEqual(textToBraille('HELLO'))
  })

  it('多个字符转换正确', () => {
    const result = textToBraille('AB')
    expect(result).toEqual([[1], [1, 2]])
  })

  it('空格转换为空数组', () => {
    const result = textToBraille('A B')
    expect(result).toEqual([[1], [], [1, 2]])
  })

  it('未知字符映射为空数组', () => {
    const result = textToBraille('@#$')
    expect(result).toEqual([[], [], []])
  })
})

describe('brailleToText', () => {
  it('A的点位返回A', () => {
    expect(brailleToText([1])).toBe('A')
  })

  it('空点位返回空格', () => {
    expect(brailleToText([])).toBe(' ')
  })

  it('点位顺序不影响结果', () => {
    expect(brailleToText([2, 1])).toBe(brailleToText([1, 2]))
  })

  it('未知点位返回问号', () => {
    expect(brailleToText([99])).toBe('?')
  })

  it('双向转换一致性', () => {
    const testChars = ['A', 'B', 'Z', ' ']
    for (const char of testChars) {
      const dots = BRAILLE_MAP[char] || []
      expect(brailleToText(dots)).toBe(char)
    }
  })
})

describe('dotsToUnicode', () => {
  it('空点位返回空格盲文', () => {
    expect(dotsToUnicode([])).toBe('⠀')
  })

  it('A的点位返回正确的Unicode字符', () => {
    expect(dotsToUnicode([1])).toBe('⠁')
  })

  it('多个点位组合正确', () => {
    expect(dotsToUnicode([1, 2, 3, 4, 5, 6])).toBe('⠿')
  })

  it('textToBraille与dotsToUnicode联动', () => {
    const text = 'HELLO'
    const braille = textToBraille(text)
    const unicode = braille.map(d => dotsToUnicode(d)).join('')
    expect(unicode.length).toBe(text.length)
  })
})

describe('核心流程集成测试', () => {
  it('完整翻译流程：文本→盲文点位→Unicode→字符', () => {
    const input = 'ABC'
    const dotsArray = textToBraille(input)
    expect(dotsArray.length).toBe(3)

    const unicodes = dotsArray.map(dotsToUnicode)
    expect(unicodes.every(u => typeof u === 'string' && u.length > 0)).toBe(true)

    const recovered = dotsArray.map(dots => brailleToText(dots)).join('')
    expect(recovered).toBe(input)
  })

  it('翻译与速查表一致性', () => {
    for (const [char, dots] of Object.entries(BRAILLE_MAP)) {
      const result = textToBraille(char)
      expect(result.length).toBe(1)
      expect(result[0].sort()).toEqual(dots.sort())
    }
  })
})
