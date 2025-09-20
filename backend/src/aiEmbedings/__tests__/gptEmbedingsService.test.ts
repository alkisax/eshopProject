import axios from 'axios';
import { getEmbedding } from '../gptEmbedingsService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getEmbedding', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns embedding array on success', async () => {
    const fakeVector = [0.1, 0.2, 0.3];
    mockedAxios.post.mockResolvedValueOnce({
      data: { data: [{ embedding: fakeVector }] },
    });

    const result = await getEmbedding('hello world');
    expect(result).toEqual(fakeVector);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.openai.com/v1/embeddings',
      {
        model: 'text-embedding-3-small',
        input: 'hello world',
      },
      expect.objectContaining({
        headers: expect.any(Object),
      })
    );
  });

  it('throws with message if axios rejects with Error', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network down'));
    await expect(getEmbedding('fail')).rejects.toThrow(
      'Error fetching embedding: Network down'
    );
  });

  it('throws generic error if axios rejects with non-Error', async () => {
    mockedAxios.post.mockRejectedValueOnce('bad thing happened');
    await expect(getEmbedding('fail')).rejects.toThrow(
      'Error fetching embedding: Unknown error'
    );
  });
});
