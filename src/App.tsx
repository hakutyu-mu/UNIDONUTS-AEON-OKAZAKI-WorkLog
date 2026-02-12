import { Home } from './components/pages/Home';
import { SecurityGate } from './components/features/SecurityGate';

function App() {
  return (
    <SecurityGate>
      <Home />
    </SecurityGate>
  );
}

export default App;
