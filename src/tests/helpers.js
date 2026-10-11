import { jest } from '@jest/globals';

// a fake mongoose query: populate/select return the same object and awaiting it yields the result
export const fakequery = (result, error) => {
    const q = {
        populate: jest.fn(() => q),
        select: jest.fn(() => q),
        then: (resolve, reject) => (error ? Promise.reject(error) : Promise.resolve(result)).then(resolve, reject)
    };
    return q;
};

export const validid = '64b7f0c2a1b2c3d4e5f60718';
