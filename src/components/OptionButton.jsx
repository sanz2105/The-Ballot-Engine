import React from 'react'

export default React.memo(function OptionButton({ option, isChosen, stage, onSelect }) {
  let buttonClass = 'option-btn'

  if (stage === 'feedback') {
    if (isChosen && option.isCorrect) {
      buttonClass += ' correct'
    } else if (isChosen && !option.isCorrect) {
      buttonClass += ' chosen-wrong anim-shake'
    } else if (!isChosen && option.isCorrect) {
      buttonClass += ' best-answer'
    }
  }

  return (
    <button
      className={buttonClass}
      disabled={stage === 'feedback'}
      onClick={() => onSelect(option)}
      aria-pressed={stage === 'feedback' ? isChosen : undefined}
      aria-label={`Option ${option.id.toUpperCase()}: ${option.text}`}
    >
      {/* Letter Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2.5rem',
          height: '2.5rem',
          minWidth: '2.5rem',
          background: 'rgba(245, 200, 66, 0.1)',
          border: '1px solid rgba(245, 200, 66, 0.2)',
          borderRadius: '6px',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: 'var(--gold)',
        }}
      >
        {option.id.toUpperCase()}
      </div>

      {/* Option Text */}
      <span style={{ flex: 1, textAlign: 'left' }}>{option.text}</span>

      {/* Label Tag */}
      <span
        style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          letterSpacing: '0.05em',
          opacity: 0.7,
          minWidth: 'fit-content',
          marginLeft: '0.5rem',
        }}
      >
        {option.label}
      </span>
    </button>
  )
}
})
