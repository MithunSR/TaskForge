import { describe, expect, it } from 'vitest';
import { AuthContext } from './AuthContext';

describe('AuthContext', () => {
  it('creates an auth context with a provider', () => {
    expect(AuthContext).toBeDefined();
    expect(AuthContext.Provider).toBeDefined();
  });
});
