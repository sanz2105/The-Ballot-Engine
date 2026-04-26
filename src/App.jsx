import { useGameEngine } from './hooks/useGameEngine'
import { useAuth } from './hooks/useAuth'
import IntroScreen from './screens/IntroScreen'
import GameScreen from './screens/GameScreen'
import ResultsScreen from './screens/ResultsScreen'
import ErrorBoundary from './components/ErrorBoundary'
import { initRemoteConfig } from './services/remoteConfigService'
import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    initRemoteConfig()
  }, [])
  const engine = useGameEngine()
  const { user, signIn, signOut } = useAuth()

  const handleStart = () => {
    engine.startGame()
    engine.trackGameStarted(!!user)
  }

  const renderScreen = () => {
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

    return null
  }

  return (
    <ErrorBoundary>
      {renderScreen()}
    </ErrorBoundary>
  )
}
