import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout';
import { HomePage } from './pages/home';
import { TasksPage } from './pages/tasks';
import { NotesPage } from './pages/notes';
import { AIDraftPage } from './pages/ai-draft';
import { SummaryPage } from './pages/summary';
import { SettingsPage } from './pages/settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="ai-draft" element={<AIDraftPage />} />
          <Route path="summary" element={<SummaryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
