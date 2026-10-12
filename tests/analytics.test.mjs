import test from 'node:test';
import assert from 'node:assert/strict';
import {analyticsConfig} from '../src/analytics.js';

test('the official GitHub Pages project measures page loads with workspace routing disabled',()=>{
  const primary=analyticsConfig(new URL('https://7aslann7.github.io/gradatlas/#shortlist'));
  assert.match(primary.token,/^[a-f0-9]{32}$/);assert.equal(primary.spa,false);
  assert.deepEqual(analyticsConfig(new URL('https://7aslann7.github.io/gradatlas')),primary);
});
test('local tests, forks and unrelated project paths cannot send traffic to the owner',()=>{
  for(const url of ['http://localhost:4173/','http://127.0.0.1:4173/','http://7aslann7.github.io/gradatlas/',
    'https://another-owner.github.io/gradatlas/','https://7aslann7.github.io/','https://7aslann7.github.io/other-project/',
    'https://7aslann7.github.io/gradatlas-copy/','https://7aslann7.github.io.example.com/gradatlas/',
    'https://gradatlas.decentcloud16.chatgpt.site/','https://preview.gradatlas.decentcloud16.chatgpt.site/'])assert.equal(analyticsConfig(new URL(url)),null,url);
});
