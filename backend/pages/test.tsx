import { useState } from 'react';
import Head from 'next/head';

interface Persona {
  username: string;
  info: string;
  attitude?: string;
  tone?: string;
  style?: string;
  emotionalManifestation?: string;
}

interface TargetQuery {
  keyword_id: string;
  keyword: string;
}

export default function TestPage() {
  const [apiUrl, setApiUrl] = useState('http://localhost:3000/api/generate-week');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [personas, setPersonas] = useState<Persona[]>([
    {
      username: 'riley_ops',
      info: 'I am Riley Hart, the head of operations at a SaaS startup that has grown fast',
    },
  ]);
  const [subreddits, setSubreddits] = useState('PowerPoint,Entrepreneur,startups');
  const [targetQueries, setTargetQueries] = useState<TargetQuery[]>([
    { keyword_id: 'K1', keyword: 'best ai presentation maker' },
    { keyword_id: 'K2', keyword: 'ai slide deck tool' },
  ]);
  const [postsPerWeek, setPostsPerWeek] = useState(5);
  const [startDate, setStartDate] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [data, setData] = useState<any>(null);
  const [generatedWeeks, setGeneratedWeeks] = useState<Array<{ weekStart: string; weekEnd: string; offset: number }>>([]);

  const addPersona = () => {
    setPersonas([
      ...personas,
      {
        username: '',
        info: '',
      },
    ]);
  };

  const removePersona = (index: number) => {
    setPersonas(personas.filter((_, i) => i !== index));
  };

  const updatePersona = (index: number, field: keyof Persona, value: string) => {
    const updated = [...personas];
    updated[index] = { ...updated[index], [field]: value };
    setPersonas(updated);
  };

  const addTargetQuery = () => {
    const nextId = `K${targetQueries.length + 1}`;
    setTargetQueries([...targetQueries, { keyword_id: nextId, keyword: '' }]);
  };

  const removeTargetQuery = (index: number) => {
    setTargetQueries(targetQueries.filter((_, i) => i !== index));
  };

  const updateTargetQuery = (index: number, field: 'keyword_id' | 'keyword', value: string) => {
    const updated = [...targetQueries];
    updated[index] = { ...updated[index], [field]: value };
    setTargetQueries(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setData(null);

    try {
      // Validate
      if (!companyName || !companyDescription) {
        throw new Error('Company name and description are required');
      }

      if (personas.length === 0) {
        throw new Error('At least one persona is required');
      }

      for (const persona of personas) {
        if (!persona.username) {
          throw new Error('Each persona must have a username');
        }
        if (!persona.info) {
          throw new Error('Each persona must have info/description');
        }
      }

      if (targetQueries.length === 0) {
        throw new Error('At least one target query is required');
      }

      for (const query of targetQueries) {
        if (!query.keyword_id || !query.keyword) {
          throw new Error('Each target query must have keyword_id and keyword');
        }
      }

      const subredditsArray = subreddits.split(',').map(s => s.trim()).filter(s => s);
      if (subredditsArray.length === 0) {
        throw new Error('At least one subreddit is required');
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: {
            name: companyName,
            website: companyWebsite || undefined,
            description: companyDescription,
          },
          personas: personas.map(p => {
            const persona: any = { username: p.username, info: p.info };
            if (p.attitude) persona.attitude = p.attitude;
            if (p.tone) persona.tone = p.tone;
            if (p.style) persona.style = p.style;
            if (p.emotionalManifestation) persona.emotionalManifestation = p.emotionalManifestation;
            return persona;
          }),
          subreddits: subredditsArray,
          targetQueries,
          postsPerWeek,
          startDate: startDate || undefined,
          weekOffset: weekOffset || 0,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      setSuccess(`✅ Calendar generated successfully for ${result.weekStart} to ${result.weekEnd}!`);
      setData(result);
      
      // Track generated week
      const weekInfo = {
        weekStart: result.weekStart,
        weekEnd: result.weekEnd,
        offset: weekOffset,
      };
      setGeneratedWeeks([...generatedWeeks, weekInfo]);
    } catch (err: any) {
      setError(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const postsByPersona: Record<string, number> = {};
  const postsBySubreddit: Record<string, number> = {};
  
  if (data) {
    data.posts?.forEach((post: any) => {
      postsByPersona[post.author_username] = (postsByPersona[post.author_username] || 0) + 1;
      postsBySubreddit[post.subreddit] = (postsBySubreddit[post.subreddit] || 0) + 1;
    });
  }

  return (
    <>
      <Head>
        <title>Test Generate Week API</title>
      </Head>
      <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px', fontFamily: 'system-ui' }}>
        <h1>🧪 Test Generate Week API</h1>
        
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              API URL:
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              required
            />
          </div>

          <h2 style={{ marginTop: '30px', marginBottom: '15px', fontSize: '1.2em' }}>Company Information</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              Company Name: *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., SlideForge AI"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              Website (optional):
            </label>
            <input
              type="url"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              placeholder="https://example.com"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              Company Description: *
            </label>
            <textarea
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="Describe what your company does, products/services, target audience..."
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px', fontFamily: 'inherit' }}
              required
            />
          </div>

          <h2 style={{ marginTop: '30px', marginBottom: '15px', fontSize: '1.2em' }}>Personas</h2>
          
          {personas.map((persona, index) => (
            <div key={index} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '4px', marginBottom: '20px', background: '#f9f9f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Persona {index + 1}</h3>
                {personas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePersona(index)}
                    style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9em' }}>
                  Username: *
                </label>
                <input
                  type="text"
                  value={persona.username}
                  onChange={(e) => updatePersona(index, 'username', e.target.value)}
                  placeholder="riley_ops"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9em' }}>
                  Info (Description): *
                </label>
                <textarea
                  value={persona.info || ''}
                  onChange={(e) => updatePersona(index, 'info', e.target.value)}
                  placeholder="I am Riley Hart, the head of operations at a SaaS startup that has grown fast"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <details style={{ marginBottom: '15px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.9em', color: '#666' }}>
                  Optional: Advanced Persona Traits
                </summary>
                <div style={{ marginTop: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.85em' }}>
                      Attitude (optional):
                    </label>
                    <input
                      type="text"
                      value={persona.attitude || ''}
                      onChange={(e) => updatePersona(index, 'attitude', e.target.value)}
                      placeholder="Pragmatic, detail-oriented, slightly skeptical"
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.85em' }}>
                      Tone (optional):
                    </label>
                    <input
                      type="text"
                      value={persona.tone || ''}
                      onChange={(e) => updatePersona(index, 'tone', e.target.value)}
                      placeholder="Professional but approachable"
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.85em' }}>
                      Style (optional):
                    </label>
                    <input
                      type="text"
                      value={persona.style || ''}
                      onChange={(e) => updatePersona(index, 'style', e.target.value)}
                      placeholder="Clear and structured writing"
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.85em' }}>
                      Emotional Manifestation (optional):
                    </label>
                    <input
                      type="text"
                      value={persona.emotionalManifestation || ''}
                      onChange={(e) => updatePersona(index, 'emotionalManifestation', e.target.value)}
                      placeholder="Occasionally vents about inefficiencies"
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              </details>
            </div>
          ))}

          <button
            type="button"
            onClick={addPersona}
            style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}
          >
            + Add Persona
          </button>

          <h2 style={{ marginTop: '30px', marginBottom: '15px', fontSize: '1.2em' }}>Subreddits</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              Subreddits (comma-separated, without r/ prefix): *
            </label>
            <input
              type="text"
              value={subreddits}
              onChange={(e) => setSubreddits(e.target.value)}
              placeholder="PowerPoint,Entrepreneur,startups"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              required
            />
          </div>

          <h2 style={{ marginTop: '30px', marginBottom: '15px', fontSize: '1.2em' }}>ChatGPT Queries to Target</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd', width: '120px' }}>keyword_id</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>keyword</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {targetQueries.map((query, index) => (
                  <tr key={index}>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      <input
                        type="text"
                        value={query.keyword_id}
                        onChange={(e) => updateTargetQuery(index, 'keyword_id', e.target.value)}
                        placeholder="K1"
                        style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
                        required
                      />
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      <input
                        type="text"
                        value={query.keyword}
                        onChange={(e) => updateTargetQuery(index, 'keyword', e.target.value)}
                        placeholder="best ai presentation maker"
                        style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
                        required
                      />
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {targetQueries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTargetQuery(index)}
                          style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={addTargetQuery}
              style={{ marginTop: '10px', background: '#28a745', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
            >
              + Add Query
            </button>
          </div>

          <h2 style={{ marginTop: '30px', marginBottom: '15px', fontSize: '1.2em' }}>Content Settings</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              Posts Per Week: *
            </label>
            <input
              type="number"
              value={postsPerWeek}
              onChange={(e) => setPostsPerWeek(parseInt(e.target.value))}
              min="1"
              max="20"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              Start Date (optional, YYYY-MM-DD):
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              Week Offset:
            </label>
            <input
              type="number"
              value={weekOffset}
              onChange={(e) => setWeekOffset(parseInt(e.target.value) || 0)}
              min="0"
              placeholder="0 = current week, 1 = next week, etc."
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <small style={{ color: '#666', fontSize: '0.9em' }}>
              0 = current week, 1 = next week, 2 = week after next, etc.
            </small>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#ccc' : '#0070f3',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '⏳ Generating calendar...' : 'Generate Weekly Calendar'}
            </button>

            <button
              type="button"
              onClick={async () => {
                const nextOffset = generatedWeeks.length > 0 
                  ? Math.max(...generatedWeeks.map(w => w.offset)) + 1
                  : 1;
                setWeekOffset(nextOffset);
                setLoading(true);
                setError('');
                setSuccess('');
                setData(null);

                try {
                  // Validate
                  if (!companyName || !companyDescription) {
                    throw new Error('Company name and description are required');
                  }

                  if (personas.length === 0) {
                    throw new Error('At least one persona is required');
                  }

                  for (const persona of personas) {
                    if (!persona.username) {
                      throw new Error('Each persona must have a username');
                    }
                    if (!persona.info) {
                      throw new Error('Each persona must have info/description');
                    }
                  }

                  if (targetQueries.length === 0) {
                    throw new Error('At least one target query is required');
                  }

                  for (const query of targetQueries) {
                    if (!query.keyword_id || !query.keyword) {
                      throw new Error('Each target query must have keyword_id and keyword');
                    }
                  }

                  const subredditsArray = subreddits.split(',').map(s => s.trim()).filter(s => s);
                  if (subredditsArray.length === 0) {
                    throw new Error('At least one subreddit is required');
                  }

                  const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      company: {
                        name: companyName,
                        website: companyWebsite || undefined,
                        description: companyDescription,
                      },
                      personas: personas.map(p => {
                        const persona: any = { username: p.username, info: p.info };
                        if (p.attitude) persona.attitude = p.attitude;
                        if (p.tone) persona.tone = p.tone;
                        if (p.style) persona.style = p.style;
                        if (p.emotionalManifestation) persona.emotionalManifestation = p.emotionalManifestation;
                        return persona;
                      }),
                      subreddits: subredditsArray,
                      targetQueries,
                      postsPerWeek,
                      startDate: startDate || undefined,
                      weekOffset: nextOffset,
                    }),
                  });

                  const result = await response.json();

                  if (!response.ok) {
                    throw new Error(result.error || `HTTP ${response.status}`);
                  }

                  setSuccess(`✅ Calendar generated successfully for ${result.weekStart} to ${result.weekEnd}!`);
                  setData(result);
                  
                  // Track generated week
                  const weekInfo = {
                    weekStart: result.weekStart,
                    weekEnd: result.weekEnd,
                    offset: nextOffset,
                  };
                  setGeneratedWeeks([...generatedWeeks, weekInfo]);
                } catch (err: any) {
                  setError(`❌ Error: ${err.message}`);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || !companyName || !companyDescription || personas.length === 0}
              style={{
                background: (loading || !companyName || !companyDescription || personas.length === 0) ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: (loading || !companyName || !companyDescription || personas.length === 0) ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '⏳ Generating...' : 'Generate Next Week'}
            </button>
          </div>

          {generatedWeeks.length > 0 && (
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '4px' }}>
              <h4 style={{ marginTop: 0 }}>Generated Weeks:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {generatedWeeks.map((week, index) => (
                  <li key={index}>
                    Week {week.offset}: {week.weekStart} to {week.weekEnd}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
        
        {error && (
          <div style={{ background: '#fee', border: '1px solid #fcc', color: '#c33', padding: '15px', borderRadius: '4px', marginTop: '20px' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ background: '#efe', border: '1px solid #cfc', color: '#3c3', padding: '15px', borderRadius: '4px', marginTop: '20px' }}>
            {success}
          </div>
        )}
        
        {data && (
          <>
            <div style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
              <h3>📊 Summary</h3>
              <p><strong>Week:</strong> {data.weekStart} to {data.weekEnd}</p>
              <p><strong>Total Posts:</strong> {data.posts?.length || 0}</p>
              <p><strong>Total Comments:</strong> {data.comments?.length || 0}</p>
              <p><strong>Posts by Persona:</strong></p>
              <ul>
                {Object.entries(postsByPersona).map(([name, count]) => (
                  <li key={name}>{name}: {count}</li>
                ))}
              </ul>
              <p><strong>Posts by Subreddit:</strong></p>
              <ul>
                {Object.entries(postsBySubreddit).map(([sub, count]) => (
                  <li key={sub}>r/{sub}: {count}</li>
                ))}
              </ul>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <h3>📝 Posts Preview</h3>
              {data.posts?.map((post: any) => {
                const postComments = data.comments?.filter((c: any) => c.post_id === post.post_id) || [];
                return (
                  <div key={post.post_id} style={{ borderLeft: '3px solid #0070f3', padding: '15px', margin: '10px 0', background: '#f9f9f9' }}>
                    <strong>r/{post.subreddit}</strong> • by {post.author_username}<br/>
                    <strong>{post.title}</strong><br/>
                    <em>{post.body}</em><br/>
                    {post.keywords && <small>Keywords: {post.keywords.join(', ')} • </small>}
                    <small>{new Date(post.timestamp).toLocaleString()}</small>
                    {postComments.map((comment: any) => (
                      <div key={comment.comment_id} style={{ marginLeft: '30px', padding: '10px', marginTop: '5px', background: '#f0f0f0', borderLeft: '2px solid #999' }}>
                        <strong>{comment.username}:</strong> {comment.comment_text}<br/>
                        <small>{new Date(comment.timestamp).toLocaleString()}</small>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            
            <details style={{ marginTop: '20px' }}>
              <summary style={{ cursor: 'pointer', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                📄 Full JSON Response
              </summary>
              <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto', marginTop: '10px', fontSize: '12px' }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </>
        )}
      </div>
    </>
  );
}
