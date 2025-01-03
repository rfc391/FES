
import { renderHook, act } from "@testing-library/react-hooks";
import { useToast } from "@/hooks/use-toast";

describe("useToast Hook", () => {
  it("should add a toast", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ title: "Test Toast" });
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("Test Toast");
  });

  it("should dismiss a toast", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      const toast = result.current.toast({ title: "Dismiss Me" });
      result.current.dismiss(toast.id);
    });
    expect(result.current.toasts).toHaveLength(0);
  });
});
