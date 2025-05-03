import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import './common/style/common.style.css';
import AppLayout from './Layout/AppLayout';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <div>
      {/* layoout : 전체적으로 보이는 것 */}
      <AppLayout>
        <AppRouter />
      </AppLayout>
    </div>
  );
}

export default App;
