import { DrawingBoard } from './components/drawing-board';
import { CanvasStateProvider } from './providers/state-provider';
import { StorageProvider } from './providers/storage-provider';

function App() {
  return (
    <StorageProvider>
      <CanvasStateProvider>
        <DrawingBoard />
      </CanvasStateProvider>
    </StorageProvider>
  );
}

export default App;
