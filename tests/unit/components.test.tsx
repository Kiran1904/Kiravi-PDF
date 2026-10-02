import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ToolFeedback } from "@/components/tools/ToolFeedback";
import { DownloadResult } from "@/components/upload/DownloadResult";
import { ErrorMessage } from "@/components/upload/ErrorMessage";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { FileList } from "@/components/upload/FileList";
import { ProgressIndicator } from "@/components/upload/ProgressIndicator";

const pdf = (name: string, size = 10) =>
  new File([new Uint8Array(size) as BlobPart], name, { type: "application/pdf", lastModified: 1 });

describe("FileDropzone", () => {
  it("is a real button over a hidden input and forwards chosen files", () => {
    const onFiles = vi.fn();
    render(
      <FileDropzone
        accept="application/pdf,.pdf"
        acceptLabel="PDF files"
        multiple
        onFiles={onFiles}
        maxLabel="Up to 100 MB"
      />,
    );

    expect(screen.getByRole("button", { name: /Drag & drop your files here/ })).toBeEnabled();
    expect(screen.getByText("PDF files · Up to 100 MB")).toBeInTheDocument();

    const input = screen.getByLabelText("Choose files — PDF files") as HTMLInputElement;
    expect(input).toHaveAttribute("accept", "application/pdf,.pdf");
    expect(input).toHaveAttribute("multiple");

    const click = vi.spyOn(input, "click");
    fireEvent.click(screen.getByRole("button"));
    expect(click).toHaveBeenCalled();

    const file = pdf("a.pdf");
    fireEvent.change(input, { target: { files: [file] } });
    expect(onFiles).toHaveBeenCalledTimes(1);
    expect(onFiles.mock.calls[0][0][0]).toBe(file);
  });

  it("accepts dropped files and ignores drops while disabled", () => {
    const onFiles = vi.fn();
    const { rerender } = render(
      <FileDropzone accept=".pdf" acceptLabel="PDF" multiple={false} onFiles={onFiles} />,
    );
    const zone = screen.getByRole("button").parentElement!;
    fireEvent.drop(zone, { dataTransfer: { files: [pdf("x.pdf")] } });
    expect(onFiles).toHaveBeenCalledTimes(1);

    rerender(<FileDropzone accept=".pdf" acceptLabel="PDF" multiple={false} onFiles={onFiles} disabled />);
    fireEvent.drop(zone, { dataTransfer: { files: [pdf("y.pdf")] } });
    expect(onFiles).toHaveBeenCalledTimes(1);
  });
});

describe("FileList", () => {
  it("lists files with sizes, removes, and reorders with accessible buttons", () => {
    const onRemove = vi.fn();
    const onMove = vi.fn();
    render(
      <FileList
        files={[pdf("a.pdf", 2048), pdf("b.pdf", 512)]}
        reorderable
        onRemove={onRemove}
        onMove={onMove}
      />,
    );

    expect(screen.getByText("a.pdf")).toBeInTheDocument();
    expect(screen.getByText("2 KB")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Move a.pdf up" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move b.pdf down" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Move b.pdf up" }));
    expect(onMove).toHaveBeenCalledWith(1, 0);
    fireEvent.click(screen.getByRole("button", { name: "Remove a.pdf" }));
    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it("hides reorder controls for a single file", () => {
    render(<FileList files={[pdf("only.pdf")]} reorderable onRemove={vi.fn()} onMove={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /Move/ })).toBeNull();
  });
});

describe("status components", () => {
  it("ErrorMessage uses alert for errors and status for notices", () => {
    render(<ErrorMessage message="Something went wrong while processing your file. Please try again." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
    render(<ErrorMessage variant="notice" title="Heads up" />);
    expect(screen.getByRole("status")).toHaveTextContent("Heads up");
  });

  it("ProgressIndicator exposes progress to assistive tech", () => {
    render(<ProgressIndicator done={1} total={4} label="Pages processed" />);
    const bar = screen.getByRole("progressbar", { name: "Pages processed" });
    expect(bar).toHaveAttribute("aria-valuenow", "25");
    expect(screen.getByText("1 / 4")).toBeInTheDocument();
  });

  it("ToolFeedback renders warnings, errors and processing in one live region", () => {
    const dismiss = vi.fn();
    const { rerender } = render(
      <ToolFeedback
        tool={{
          status: "ready",
          error: null,
          warnings: ["x.pdf: This file is empty."],
          progress: null,
          dismissWarnings: dismiss,
        }}
      />,
    );
    expect(screen.getByText("One file was skipped")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(dismiss).toHaveBeenCalled();

    rerender(
      <ToolFeedback
        tool={{ status: "error", error: "Nope.", warnings: [], progress: null, dismissWarnings: dismiss }}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Nope.");

    rerender(
      <ToolFeedback
        tool={{
          status: "processing",
          error: null,
          warnings: [],
          progress: { done: 2, total: 5 },
          dismissWarnings: dismiss,
        }}
        processingLabel="Merging…"
      />,
    );
    expect(screen.getByText("Merging…")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40");
  });
});

describe("DownloadResult", () => {
  const blob = (size: number, type = "application/pdf") =>
    new Blob([new Uint8Array(size) as BlobPart], { type });

  it("offers a single download for one result and a ZIP for many", () => {
    const onDownload = vi.fn();
    const onDownloadAll = vi.fn();
    const { rerender } = render(
      <DownloadResult
        results={[{ name: "a.pdf", blob: blob(100) }]}
        onDownload={onDownload}
        onDownloadAll={onDownloadAll}
        onReset={vi.fn()}
      />,
    );
    expect(screen.getByRole("heading", { name: /your file is ready/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Download" }));
    expect(onDownloadAll).toHaveBeenCalledTimes(1);

    rerender(
      <DownloadResult
        results={[
          { name: "a.pdf", blob: blob(100), originalBytes: 400 },
          { name: "b.pdf", blob: blob(300) },
        ]}
        onDownload={onDownload}
        onDownloadAll={onDownloadAll}
        onReset={vi.fn()}
        originalBytes={1000}
      />,
    );
    expect(screen.getByRole("heading", { name: /2 files are ready/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download all as ZIP" })).toBeInTheDocument();
    expect(screen.getByText("60% smaller than the original")).toBeInTheDocument();
    expect(screen.getByText(/−75%/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Download b.pdf" }));
    expect(onDownload).toHaveBeenCalledWith(expect.objectContaining({ name: "b.pdf" }));
  });

  it("says so when no reduction was possible", () => {
    render(
      <DownloadResult
        results={[
          { name: "a.pdf", blob: blob(500) },
          { name: "b.pdf", blob: blob(500) },
        ]}
        onDownload={vi.fn()}
        onDownloadAll={vi.fn()}
        onReset={vi.fn()}
        originalBytes={900}
      />,
    );
    expect(screen.getByText(/no size reduction was possible/)).toBeInTheDocument();
  });
});
