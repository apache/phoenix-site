//
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Link } from "@/components/link";

vi.mock("react-router", () => ({
  Link: ({ to, reloadDocument, children, ...rest }: any) => {
    const href =
      typeof to === "string"
        ? to
        : `${to?.pathname ?? ""}${to?.search ?? ""}${to?.hash ?? ""}`;

    return (
      <a
        href={href}
        data-reload-document={String(Boolean(reloadDocument))}
        {...rest}
      >
        {children}
      </a>
    );
  }
}));

describe("Link wrapper", () => {
  it("does not force hard reload for app routes", () => {
    render(<Link to="/docs/features/transactions">Transactions</Link>);

    const link = screen.getByRole("link", { name: "Transactions" });
    expect(link).toHaveAttribute("data-reload-document", "false");
  });

  it("forces hard reload for phoenix.apache.org absolute links", () => {
    render(<Link to="https://phoenix.apache.org/docs">Phoenix Docs</Link>);

    const link = screen.getByRole("link", { name: "Phoenix Docs" });
    expect(link).toHaveAttribute("data-reload-document", "true");
  });

  it("forces hard reload for static file paths", () => {
    render(<Link to="/presentations/Drillix.pdf">Slides</Link>);

    const link = screen.getByRole("link", { name: "Slides" });
    expect(link).toHaveAttribute("data-reload-document", "true");
  });

  it("forces hard reload for static file paths with query/hash", () => {
    render(<Link to="/phoenixcon-archives.html?ref=menu#top">Archive</Link>);

    const link = screen.getByRole("link", { name: "Archive" });
    expect(link).toHaveAttribute("data-reload-document", "true");
  });
});
