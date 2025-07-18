import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppShortcuts } from './components/Layout/AppShortcuts';
import Layout from './components/Layout/Layout';
import MainEditor from './components/Editor/MainEditor';
import SettingsPage from './components/Settings/SettingsPage';
import Dashboard from './components/Dashboard/Dashboard';
import { AIAssistantPage } from './components/AI/AIAssistantPage';
import { SuggestionsPage } from './components/Suggestions/SuggestionsPage';
import { AnalyticsPage } from './components/Analytics/AnalyticsPage';
import TextGenerationPage from './components/TextGeneration/TextGenerationPage';
import RewritingTool from './components/tools/RewritingTool';
import SummarizationTool from './components/tools/SummarizationTool';
import TranslationTool from './components/tools/TranslationTool';
import { SEOTool } from './components/tools/SEOTool';
import { TemplateTool } from './components/tools/TemplateTool';
import { CollaborationTool } from './components/tools/CollaborationTool';
import { AIWritingPage } from './components/AIWriting/AIWritingPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppShortcuts>
          <div className="h-screen">
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/editor" element={<MainEditor />} />
                <Route path="/ai-writing" element={<AIWritingPage />} />
                <Route path="/text-generation" element={<TextGenerationPage />} />
                <Route path="/rewriting" element={<RewritingTool />} />
                <Route path="/summarization" element={<SummarizationTool />} />
                <Route path="/translation" element={<TranslationTool />} />
                <Route path="/seo" element={<SEOTool />} />
                <Route path="/templates" element={<TemplateTool />} />
                <Route path="/collaboration" element={<CollaborationTool />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/ai" element={<AIAssistantPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/suggestions" element={<SuggestionsPage />} />
              </Routes>
            </Layout>
          </div>
        </AppShortcuts>
      </Router>
    </ThemeProvider>
  );
}

export default App;