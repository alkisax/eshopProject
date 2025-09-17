import axios from "axios";
import { getGPTResponse } from "../gpt.service";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("getGPTResponse", () => {
  const apiKey = "fake-api-key";
  const prompt = "Check this:";
  const comment = "Test comment";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("calls axios.post with correct args and returns content", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: "true" } }],
      },
    });

    const result = await getGPTResponse(comment, prompt, apiKey);

    // return value
    expect(result).toBe("true");

    // call args
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: `${prompt} ${comment}` }],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
  });

  it("wraps axios Error with correct message", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Network down"));

    await expect(getGPTResponse(comment, prompt, apiKey)).rejects.toThrow(
      "Error fetching GPT response: Network down"
    );
  });

  it("wraps string error correctly", async () => {
    mockedAxios.post.mockRejectedValueOnce("some string error");

    await expect(getGPTResponse(comment, prompt, apiKey)).rejects.toThrow(
      "Error fetching GPT response: some string error"
    );
  });

  it("wraps unknown error correctly", async () => {
    mockedAxios.post.mockRejectedValueOnce({ foo: "bar" });

    await expect(getGPTResponse(comment, prompt, apiKey)).rejects.toThrow(
      "Error fetching GPT response: Unknown error"
    );
  });
});
