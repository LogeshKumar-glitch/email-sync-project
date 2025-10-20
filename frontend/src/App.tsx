import React, { useEffect, useState } from 'react';
import axios from 'axios';
export default function App() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any|null>(null);
  const [suggest, setSuggest] = useState('');
  async function doSearch() {
    const res = await axios.get('/search', { params: { q } });
    setResults(res.data);
  }
  async function getSuggest(text:string) {
    setSuggest('Loading...');
    const res = await axios.post('/suggest-reply', { text });
    setSuggest(res.data.suggestion);
  }
  return (
    <div style={{padding:20,fontFamily:'Arial'}}>
      <h2>Email Sync UI (Demo)</h2>
      <div>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="search..." />
        <button onClick={doSearch}>Search</button>
      </div>
      <div style={{display:'flex', gap:20, marginTop:20}}>
        <div style={{flex:1}}>
          <h3>Results</h3>
          <ul>
            {results.map((r:any)=>(
              <li key={r.uid + r.accountId} onClick={()=>setSelected(r)} style={{cursor:'pointer',borderBottom:'1px solid #eee',padding:8}}>
                <strong>{r.subject}</strong><br/>
                <small>{r.from} • {r.label}</small>
              </li>
            ))}
          </ul>
        </div>
        <div style={{flex:1}}>
          <h3>Detail</h3>
          {selected ? (
            <div>
              <h4>{selected.subject}</h4>
              <p><em>{selected.from}</em></p>
              <pre style={{whiteSpace:'pre-wrap'}}>{selected.text}</pre>
              <p>Label: <strong>{selected.label}</strong></p>
              <button onClick={()=>getSuggest(selected.text)}>Suggest Reply</button>
              {suggest && <div style={{marginTop:10,background:'#f7f7f7',padding:10}}>{suggest}</div>}
            </div>
          ) : <div>Select an email</div>}
        </div>
      </div>
    </div>
  );
}
