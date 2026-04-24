import { useGameEngine } from './hooks/useGameEngine'
import { useAuth } from './hooks/useAuth'
import IntroScreen from './screens/IntroScreen'
import GameScreen from './screens/GameScreen'
import ResultsScreen from './screens/ResultsScreen'
import { trackEvent } from './lib/firebase'

export default function App() {
  const engine = useGameEngine()
  const { user, signIn, signOut } = useAuth()

  const handleStart = () => {
    engine.startGame()
    trackEvent('game_started', { is_authenticated: !!user })
  }

  if (engine.gameScreen === 'intro') {
    return <IntroScreen onStart={handleStart} user={user} onSignIn={signIn} onSignOut={signOut} />
  }

  if (engine.gameScreen === 'game') {
    return <GameScreen engine={engine} />
  }

  if (engine.gameScreen === 'results') {
    return (
      <ResultsScreen
        phaseResults={engine.phaseResults}
        xp={engine.xp}
        unlockedBadges={engine.unlockedBadges}
        user={user}
        onRestart={engine.resetGame}
      />
    )
  }
}
