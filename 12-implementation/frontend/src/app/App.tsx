/**
 * React App Component
 */

import { Routes, Route } from 'react-router-dom';
import { Layout } from './layout';

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/forum" element={<div>Forum</div>} />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </Layout>
  );
}
