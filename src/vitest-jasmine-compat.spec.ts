import { describe, expect, it } from 'vitest';

globalThis.it('wraps callback-style test functions', (done) => done());

describe('Vitest Jasmine compatibility helpers', () => {
  it('supports Jasmine spy APIs and both createSpyObj signatures', () => {
    const target = { value: (input: string) => input };
    const through = spyOn(target, 'value').and.callThrough();
    expect(target.value('ok')).toBe('ok');
    expect(through.calls.count()).toBe(1);
    expect(through.calls.first().args).toEqual(['ok']);
    expect(through.calls.mostRecent().args).toEqual(['ok']);
    expect(through.calls.all()).toHaveLength(1);
    through.calls.reset();
    expect(through.calls.count()).toBe(0);

    const fake = jasmine.createSpy('fake').and.callFake(() => 'fake').and.returnValue('value');
    expect(fake()).toBe('value');
    fake.and.stub();
    expect(fake()).toBeUndefined();
    fake.and.throwError('boom');
    expect(() => fake()).toThrowError('boom');
    const existingError = new Error('existing');
    fake.and.throwError(existingError);
    expect(() => fake()).toThrow(existingError);
    jasmine.createSpy('no-original').and.callThrough();

    expect(jasmine.createSpyObj('named', ['first']).first).toBeDefined();
    expect(jasmine.createSpyObj(['second']).second).toBeDefined();

    const assertion = globalThis.expect as unknown as (value: unknown) => {
      toHaveBeenCalledOnceWith: (...args: unknown[]) => void;
      not: { toHaveBeenCalledOnceWith: (...args: unknown[]) => void };
    };
    const called = jasmine.createSpy('called');
    called('argument');
    assertion(called).toHaveBeenCalledOnceWith('argument');
    assertion(called).not.toHaveBeenCalledOnceWith('other');
  });

  it('supports clock, storage shims, observers, transfer and matcher failure paths', () => {
    const clock = jasmine.clock();
    clock.install();
    clock.mockDate(new Date('2026-01-01T00:00:00Z'));
    expect(new Date().toISOString()).toContain('2026-01-01');
    clock.uninstall();

    localStorage.clear();
    localStorage.setItem('key', 'value');
    expect(localStorage.getItem('key')).toBe('value');
    expect(localStorage.key(0)).toBe('key');
    expect(localStorage.key(99)).toBeNull();
    localStorage.removeItem('key');
    expect(localStorage.getItem('key')).toBeNull();

    const observer = new IntersectionObserver(() => undefined);
    observer.observe(document.body);
    observer.unobserve(document.body);
    observer.disconnect();

    const transfer = new DataTransfer();
    transfer.items.add(new File(['content'], 'file.txt'));
    expect(transfer.files.item(0)?.name).toBe('file.txt');
    expect(transfer.files.item(1)).toBeNull();

    (globalThis.expect(false) as unknown as { not: { toBeTrue: () => void } }).not.toBeTrue();
    (globalThis.expect(null) as unknown as { not: { toHaveSize: (size: number) => void } }).not.toHaveSize(0);
  });
});
