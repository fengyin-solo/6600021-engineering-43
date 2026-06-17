import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBrailleStore } from '../store/braille'

describe('Braille Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('初始化状态', () => {
    it('初始状态为空', () => {
      const store = useBrailleStore()
      expect(store.inputText).toBe('')
      expect(store.brailleOutput).toEqual([])
      expect(store.quizChar).toBe('')
      expect(store.selectedDots).toEqual([])
      expect(store.score).toEqual({ correct: 0, total: 0 })
      expect(store.history).toEqual([])
    })
  })

  describe('翻译功能', () => {
    it('translate() 将文本转为盲文', () => {
      const store = useBrailleStore()
      store.inputText = 'AB'
      store.translate()
      expect(store.brailleOutput).toEqual([[1], [1, 2]])
    })

    it('brailleUnicode 计算正确', () => {
      const store = useBrailleStore()
      store.inputText = 'A'
      store.translate()
      expect(store.brailleUnicode).toBe('⠁')
    })

    it('reverseTranslate() 将选中的点转为字符', () => {
      const store = useBrailleStore()
      store.selectedDots = [1]
      expect(store.reverseTranslate()).toBe('A')
    })
  })

  describe('训练模式', () => {
    it('generateQuiz() 生成有效字母', () => {
      const store = useBrailleStore()
      store.generateQuiz()
      expect(store.quizChar).toMatch(/^[A-Z]$/)
      expect(store.selectedDots).toEqual([])
    })

    it('toggleDot() 添加和移除点位', () => {
      const store = useBrailleStore()
      store.toggleDot(1)
      expect(store.selectedDots).toContain(1)
      store.toggleDot(1)
      expect(store.selectedDots).not.toContain(1)
    })

    it('checkQuizAnswer() 答对时统计正确', () => {
      const store = useBrailleStore()
      store.quizChar = 'A'
      store.selectedDots = [1]
      store.checkQuizAnswer()
      expect(store.score.correct).toBe(1)
      expect(store.score.total).toBe(1)
      expect(store.history[0].correct).toBe(true)
    })

    it('checkQuizAnswer() 答错时统计错误', () => {
      const store = useBrailleStore()
      store.quizChar = 'A'
      store.selectedDots = [1, 2]
      store.checkQuizAnswer()
      expect(store.score.correct).toBe(0)
      expect(store.score.total).toBe(1)
      expect(store.history[0].correct).toBe(false)
    })

    it('checkQuizAnswer() 自动生成下一题', () => {
      const store = useBrailleStore()
      store.generateQuiz()
      store.selectedDots = [1]
      store.checkQuizAnswer()
      expect(typeof store.quizChar).toBe('string')
      expect(store.selectedDots).toEqual([])
    })

    it('resetScore() 重置分数和历史', () => {
      const store = useBrailleStore()
      store.score = { correct: 5, total: 10 }
      store.history = [{ input: 'A', correct: true }]
      store.resetScore()
      expect(store.score).toEqual({ correct: 0, total: 0 })
      expect(store.history).toEqual([])
    })
  })

  describe('导出功能', () => {
    it('exportPDF() 生成带翻译结果的文本', () => {
      const store = useBrailleStore()
      store.inputText = 'AB'
      const result = store.exportPDF()
      expect(result).toContain('盲文翻译输出')
      expect(result).toContain('A')
      expect(result).toContain('B')
      expect(result).toContain('⠁')
      expect(result).toContain('⠃')
    })

    it('exportPDF() 处理空输入', () => {
      const store = useBrailleStore()
      store.inputText = ''
      const result = store.exportPDF()
      expect(result).toContain('盲文翻译输出')
    })
  })

  describe('学习模式切换', () => {
    it('learnMode 默认值正确', () => {
      const store = useBrailleStore()
      expect(store.learnMode).toBe('charToBraille')
    })

    it('learnMode 可以切换到其他模式', () => {
      const store = useBrailleStore()
      store.learnMode = 'brailleToChar'
      expect(store.learnMode).toBe('brailleToChar')
      store.learnMode = 'dictation'
      expect(store.learnMode).toBe('dictation')
    })
  })
})
